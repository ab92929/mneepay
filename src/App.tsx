import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const MNEE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';

const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

interface Invoice {
  amount: number;
  description: string;
  recipient: string;
  createdAt: string;
}

type StatusType = 'success' | 'error' | 'info' | 'warning';

function App() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletStatus, setWalletStatus] = useState<{ type: StatusType; message: string } | null>(null);

  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{ type: StatusType; message: string } | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setUserAddress('');
          setProvider(null);
          setSigner(null);
          setWalletStatus({ type: 'warning', message: 'Wallet disconnected. Please reconnect to pay invoices.' });
        } else {
          setUserAddress(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      checkExistingConnection();
    }
  }, []);

  const checkExistingConnection = async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (error) {
      console.log('No existing connection');
    }
  };

  const connectWallet = async () => {
    if (isConnecting) {
      setWalletStatus({ type: 'warning', message: 'Please check MetaMask and approve the connection request.' });
      return;
    }

    if (typeof window.ethereum === 'undefined') {
      setWalletStatus({ type: 'error', message: 'MetaMask not found! Please install MetaMask extension to continue.' });
      return;
    }

    try {
      setIsConnecting(true);
      setWalletStatus({ type: 'info', message: 'Please check MetaMask and approve the connection request.' });

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setUserAddress(accounts[0]);
      setWalletStatus({ type: 'success', message: 'Wallet connected successfully! You can now pay invoices.' });
    } catch (error: any) {
      let errorMessage = 'Connection failed';

      if (error.message?.includes('already pending')) {
        errorMessage = 'A connection request is already open in MetaMask. Please check your MetaMask extension.';
      } else if (error.code === 4001) {
        errorMessage = 'Connection rejected. Click the button again to reconnect.';
      }

      setWalletStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsConnecting(false);
    }
  };

  const generateInvoice = () => {
    if (!invoiceAmount || !invoiceDescription || !recipientAddress) {
      alert('Please fill in all fields');
      return;
    }

    if (!ethers.utils.isAddress(recipientAddress)) {
      alert('Invalid recipient address. Must be a valid Ethereum address.');
      return;
    }

    const invoice: Invoice = {
      amount: parseFloat(invoiceAmount),
      description: invoiceDescription,
      recipient: recipientAddress,
      createdAt: new Date().toISOString()
    };

    setCurrentInvoice(invoice);
    setPaymentStatus(null);
  };

  const payInvoice = async () => {
    if (!currentInvoice || !userAddress || !signer) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      setIsPaying(true);
      setPaymentStatus({ type: 'info', message: 'Preparing transaction... Please confirm in MetaMask.' });

      const mneeContract = new ethers.Contract(MNEE_TOKEN_ADDRESS, ERC20_ABI, signer);
      const decimals = await mneeContract.decimals();
      const amountInTokenUnits = ethers.utils.parseUnits(currentInvoice.amount.toString(), decimals);

      setPaymentStatus({ type: 'info', message: 'Transaction submitted! Waiting for confirmation...' });
      const tx = await mneeContract.transfer(currentInvoice.recipient, amountInTokenUnits);

      setPaymentStatus({ type: 'info', message: `Transaction: ${tx.hash.substring(0, 10)}... Waiting for confirmation...` });
      await tx.wait();

      setPaymentStatus({
        type: 'success',
        message: `Payment successful! Transaction: ${tx.hash.substring(0, 10)}...${tx.hash.substring(60)}`
      });
    } catch (error: any) {
      let errorMessage = 'Transaction failed';

      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setPaymentStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsPaying(false);
    }
  };

  const shortAddress = (address: string) =>
    `${address.substring(0, 6)}...${address.substring(38)}`;

  const StatusMessage = ({ status }: { status: { type: StatusType; message: string } | null }) => {
    if (!status) return null;

    const icons = {
      success: <CheckCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      info: <Loader2 className="w-5 h-5 animate-spin" />,
      warning: <AlertCircle className="w-5 h-5" />
    };

    const colors = {
      success: 'bg-green-50 text-green-800 border-green-200',
      error: 'bg-red-50 text-red-800 border-red-200',
      info: 'bg-blue-50 text-blue-800 border-blue-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    };

    return (
      <div className={`flex items-center gap-2 p-4 rounded-lg border ${colors[status.type]}`}>
        {icons[status.type]}
        <span>{status.message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">MNEE Invoice Pay</h1>
          <p className="text-xl text-slate-600 mb-2">Create and pay invoices instantly with MNEE stablecoin</p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            <strong>What is this?</strong> A simple tool for freelancers to create crypto invoices
            and for clients to pay them using MetaMask wallet and MNEE tokens.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-6 h-6 text-slate-700" />
            <h2 className="text-2xl font-bold text-slate-900">Connect Your Wallet</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            You'll need MetaMask (a crypto wallet browser extension) to pay invoices.{' '}
            <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer"
               className="text-blue-600 hover:text-blue-700 underline">
              Install MetaMask
            </a>
          </p>

          <button
            onClick={connectWallet}
            disabled={!!userAddress || isConnecting}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              userAddress
                ? 'bg-green-500 text-white cursor-not-allowed'
                : isConnecting
                ? 'bg-slate-400 text-white cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isConnecting ? 'Connecting...' : userAddress ? `Connected: ${shortAddress(userAddress)}` : 'Connect MetaMask Wallet'}
          </button>

          {walletStatus && <div className="mt-4"><StatusMessage status={walletStatus} /></div>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-slate-700" />
              <h2 className="text-2xl font-bold text-slate-900">Create Invoice</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Invoice Amount (MNEE tokens)
                </label>
                <input
                  type="number"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="e.g., 100"
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-slate-500 mt-1 block">Enter the amount in MNEE tokens</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={invoiceDescription}
                  onChange={(e) => setInvoiceDescription(e.target.value)}
                  placeholder="e.g., Website Design Services"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-slate-500 mt-1 block">Brief description of the work</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Wallet Address (to receive payment)
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-slate-500 mt-1 block">The address where you'll receive MNEE tokens</span>
              </div>

              <button
                onClick={generateInvoice}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Generate Invoice
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Invoice Preview</h2>

            {!currentInvoice ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Fill out the form to generate an invoice</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Invoice</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Description:</span>
                      <span className="font-medium text-slate-900">{currentInvoice.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount:</span>
                      <span className="font-medium text-slate-900">{currentInvoice.amount} MNEE</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-slate-600">Pay To:</span>
                      <span className="font-mono text-xs text-slate-900 break-all max-w-[200px]"
                            title={currentInvoice.recipient}>
                        {shortAddress(currentInvoice.recipient)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Due:</span>
                    <span className="text-2xl font-bold text-slate-900">{currentInvoice.amount} MNEE</span>
                  </div>
                </div>

                <button
                  onClick={payInvoice}
                  disabled={!userAddress || isPaying}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                    !userAddress || isPaying
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isPaying ? 'Processing...' : 'Pay Invoice with MNEE'}
                </button>

                <p className="text-xs text-center text-slate-500">
                  {!userAddress ? 'Connect your wallet first to enable payment' : 'Click to pay invoice with MetaMask'}
                </p>

                {paymentStatus && <StatusMessage status={paymentStatus} />}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">How It Works</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li><strong>Connect Wallet:</strong> Click "Connect MetaMask Wallet" to link your crypto wallet</li>
            <li><strong>Create Invoice:</strong> Fill in the amount, description, and recipient address</li>
            <li><strong>Generate:</strong> Click "Generate Invoice" to see a preview</li>
            <li><strong>Pay:</strong> Click "Pay Invoice with MNEE" and confirm in MetaMask</li>
            <li><strong>Done:</strong> Transaction completes and payment is sent!</li>
          </ol>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-yellow-900 mb-2">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>This is a hackathon MVP for demonstration purposes</li>
              <li>Make sure you have MNEE tokens in your wallet</li>
              <li>You'll need some ETH/MATIC for gas fees (network fees)</li>
              <li>Always verify the recipient address before paying</li>
            </ul>
          </div>
        </div>

        <footer className="text-center mt-12 text-slate-600">
          <p className="font-semibold">Built for Web3 Hackathon | MNEE Invoice Pay MVP</p>
          <p className="text-sm text-slate-500">No backend required - Pure client-side - Open source</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
