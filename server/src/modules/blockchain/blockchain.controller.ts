import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { BlockchainService } from './blockchain.service';

@ApiTags('Blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private blockchainService: BlockchainService) {}

  @Get('network')
  @ApiOperation({ summary: 'Get blockchain network information' })
  @ApiResponse({ status: 200, description: 'Network information' })
  async getNetworkInfo() {
    return this.blockchainService.getNetworkInfo();
  }

  @Get('loyalty-token/supply')
  @ApiOperation({ summary: 'Get total loyalty token supply' })
  @ApiResponse({ status: 200, description: 'Total supply' })
  async getTotalSupply() {
    const supply = await this.blockchainService.getTotalSupply();
    return { totalSupply: supply };
  }

  @Get('loyalty-token/backing-ratio')
  @ApiOperation({ summary: 'Get loyalty token backing ratio' })
  @ApiResponse({ status: 200, description: 'Backing ratio' })
  async getBackingRatio() {
    const ratio = await this.blockchainService.getBackingRatio();
    return { backingRatio: ratio };
  }

  @Get('loyalty-token/balance/:address')
  @ApiOperation({ summary: 'Get loyalty token balance for address' })
  @ApiResponse({ status: 200, description: 'Token balance' })
  async getLoyaltyTokenBalance(@Param('address') address: string) {
    const balance =
      await this.blockchainService.getLoyaltyTokenBalance(address);
    return { address, balance };
  }

  @Get('merchant/quota/:address')
  @ApiOperation({ summary: 'Get merchant quota' })
  @ApiResponse({ status: 200, description: 'Merchant quota' })
  async getMerchantQuota(@Param('address') address: string) {
    const quota = await this.blockchainService.getMerchantQuota(address);
    const isApproved = await this.blockchainService.isApprovedMerchant(address);
    return { address, quota, isApproved };
  }

  @Post('merchant/reward-user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reward user with loyalty points (merchant only)' })
  @ApiResponse({ status: 200, description: 'User rewarded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or insufficient quota',
  })
  async rewardUser(
    @Request() req,
    @Body() body: { userWallet: string; amount: string },
  ) {
    const { userWallet, amount } = body;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const merchantWallet = req.user.walletAddress;

    const success = await this.blockchainService.rewardUser(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      merchantWallet,
      userWallet,
      amount,
    );

    if (success) {
      return {
        success: true,
        message: `Rewarded ${amount} PLT to ${userWallet}`,
        merchantWallet,
        userWallet,
        amount,
      };
    } else {
      return {
        success: false,
        message: 'Failed to reward user. Check quota and approval status.',
      };
    }
  }

  @Post('user/redeem-points')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redeem loyalty points for IDRX' })
  @ApiResponse({ status: 200, description: 'Points redeemed successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  async redeemPoints(@Request() req, @Body() body: { amount: string }) {
    const { amount } = body;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userWallet = req.user.walletAddress;

    const success = await this.blockchainService.redeemPoint(
      userWallet,
      amount,
    );

    if (success) {
      return {
        success: true,
        message: `Redeemed ${amount} PLT for IDRX`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        userWallet,
        amount,
      };
    } else {
      return {
        success: false,
        message: 'Failed to redeem points. Check balance and try again.',
      };
    }
  }

  @Post('merchant/manual-redeem')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Manual redemption for physical items (merchant only)',
  })
  @ApiResponse({ status: 200, description: 'Manual redemption processed' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async manualRedeem(
    @Request() req,
    @Body() body: { userWallet: string; amount: string; item: string },
  ) {
    const { userWallet, amount, item } = body;
    const merchantWallet = req.user.walletAddress;

    const success = await this.blockchainService.manualRedeem(
      userWallet,
      amount,
      item,
      merchantWallet,
    );

    if (success) {
      return {
        success: true,
        message: `Manual redemption: ${amount} PLT for ${item}`,
        userWallet,
        merchantWallet,
        amount,
        item,
      };
    } else {
      return {
        success: false,
        message: 'Failed to process manual redemption.',
      };
    }
  }

  @Get('swap/exchange-rate/:tokenAddress')
  @ApiOperation({ summary: 'Get exchange rate for token pair' })
  @ApiResponse({ status: 200, description: 'Exchange rate' })
  async getExchangeRate(@Param('tokenAddress') tokenAddress: string) {
    const rate = await this.blockchainService.getExchangeRate(tokenAddress);
    return { tokenAddress, exchangeRate: rate };
  }

  @Post('swap/plt-for-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Swap PLT for another token' })
  @ApiResponse({ status: 200, description: 'Swap successful' })
  @ApiResponse({ status: 400, description: 'Swap failed' })
  async swapPLTForToken(
    @Request() req,
    @Body() body: { tokenAddress: string; pltAmount: string },
  ) {
    const { tokenAddress, pltAmount } = body;
    const userWallet = req.user.walletAddress;

    const success = await this.blockchainService.swapPLTForToken(
      tokenAddress,
      pltAmount,
    );

    if (success) {
      return {
        success: true,
        message: `Swapped ${pltAmount} PLT for tokens`,
        userWallet,
        tokenAddress,
        pltAmount,
      };
    } else {
      return {
        success: false,
        message: 'Swap failed. Check balance and try again.',
      };
    }
  }

  @Post('swap/token-for-plt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Swap another token for PLT' })
  @ApiResponse({ status: 200, description: 'Swap successful' })
  @ApiResponse({ status: 400, description: 'Swap failed' })
  async swapTokenForPLT(
    @Request() req,
    @Body() body: { tokenAddress: string; tokenAmount: string },
  ) {
    const { tokenAddress, tokenAmount } = body;
    const userWallet = req.user.walletAddress;

    const success = await this.blockchainService.swapTokenForPLT(
      tokenAddress,
      tokenAmount,
    );

    if (success) {
      return {
        success: true,
        message: `Swapped ${tokenAmount} tokens for PLT`,
        userWallet,
        tokenAddress,
        tokenAmount,
      };
    } else {
      return {
        success: false,
        message: 'Swap failed. Check balance and try again.',
      };
    }
  }

  @Post('validate-signature')
  @ApiOperation({ summary: 'Validate wallet signature' })
  @ApiResponse({ status: 200, description: 'Signature validation result' })
  async validateSignature(
    @Body()
    body: {
      message: string;
      signature: string;
      expectedAddress: string;
    },
  ) {
    const { message, signature, expectedAddress } = body;
    const isValid = await this.blockchainService.validateWalletSignature(
      message,
      signature,
      expectedAddress,
    );

    return {
      isValid,
      message: isValid ? 'Signature is valid' : 'Signature is invalid',
      expectedAddress,
    };
  }
}
