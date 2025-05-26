import { NextResponse } from 'next/server';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Base } from "@thirdweb-dev/chains";

// USDC contract on Base
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Our LoteriaRewards contract address
const LOTERIA_REWARDS_CONTRACT = '0x6A27A08A1c43B995E483C9304a992B8dDDB7D41c';

// Test Mode for local development
const TEST_MODE = process.env.NODE_ENV !== 'production';

// Thirdweb Client ID and Secret Key
const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '444f6c9a0e50261e2d494748c7cf930e';
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY || 'rQEspp6QmSjN_fyy9QlyTEj4qsgmvPtqKVxkMf9eabm8CNvzL4X4K6WexDV7uBF7kxSNudiTS7QH3pfiBsMQiw';

// ABI for our LoteriaRewards contract
const LOTERIA_REWARDS_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "sendReward",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Function to send rewards using our LoteriaRewards contract
async function sendReward(recipientAddress: string) {
  try {
    // Initialize the SDK with thirdweb credentials
    const sdk = ThirdwebSDK.fromPrivateKey(
      process.env.TREASURY_PRIVATE_KEY as string,
      Base,
      {
        clientId: THIRDWEB_CLIENT_ID,
        secretKey: THIRDWEB_SECRET_KEY,
      }
    );
    
    // Get our rewards contract
    const rewardsContract = await sdk.getContract(LOTERIA_REWARDS_CONTRACT, LOTERIA_REWARDS_ABI);
    
    // Call the sendReward function on our contract
    // This will send 0.002 USDC (2000 units) to the player
    const tx = await rewardsContract.call("sendReward", [recipientAddress]);
    
    return tx;
  } catch (error) {
    console.error("Error in sendReward:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { recipient, amount } = body;
    
    // Validate input
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient address is required' },
        { status: 400 }
      );
    }

    // Handle test mode for local development
    if (TEST_MODE) {
      console.log(`TEST MODE: Simulating sending 0.002 USDC to ${recipient}`);
      
      // Generate a fake transaction hash
      const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return success with simulated transaction hash
      return NextResponse.json({
        success: true,
        transactionHash: mockTxHash,
        message: `TEST MODE: Simulated sending 0.002 USDC to ${recipient}`,
        testMode: true
      });
    }
    
    // PRODUCTION MODE - Using our LoteriaRewards contract to send the reward
    
    // Send the reward using our contract
    // Note: The amount is fixed at 0.002 USDC in the contract
    const transaction = await sendReward(recipient);
    
    // Return success with transaction hash
    return NextResponse.json({
      success: true,
      transactionHash: transaction.receipt.transactionHash,
      message: `Successfully sent 0.002 USDC to ${recipient}`,
    });
    
  } catch (error: any) {
    console.error('Error sending USDC reward:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while sending the reward'
      },
      { status: 500 }
    );
  }
}
