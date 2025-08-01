import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { LoginDto, RegisterDto, MerchantRegisterDto } from '../../dto/auth.dto';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateWalletSignature(
    walletAddress: string,
    message: string,
    signature: string,
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  async login(loginDto: LoginDto) {
    const { walletAddress, signature, message } = loginDto;

    // Validate wallet signature
    const isValidSignature = await this.validateWalletSignature(
      walletAddress,
      message,
      signature,
    );
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid wallet signature');
    }

    // Find user or merchant
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    const merchant = await this.prisma.merchant.findUnique({
      where: { walletAddress },
    });

    if (!user && !merchant) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: user?.id || merchant?.id,
      walletAddress,
      userType: user ? 'user' : 'merchant',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user || merchant,
      userType: user ? 'user' : 'merchant',
    };
  }

  async registerUser(registerDto: RegisterDto) {
    const { walletAddress, email, username } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        walletAddress,
        email,
        username,
        // loyaltyPoints removed - now using blockchain balance
      },
    });

    const payload = {
      sub: user.id,
      walletAddress,
      userType: 'user',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
      userType: 'user',
    };
  }

  async registerMerchant(merchantRegisterDto: MerchantRegisterDto) {
    const { walletAddress, name, description, logoUrl } = merchantRegisterDto;

    // Check if merchant already exists
    const existingMerchant = await this.prisma.merchant.findUnique({
      where: { walletAddress },
    });

    if (existingMerchant) {
      throw new UnauthorizedException('Merchant already exists');
    }

    // Create new merchant
    const merchant = await this.prisma.merchant.create({
      data: {
        walletAddress,
        name,
        description,
        logoUrl,
      },
    });

    const payload = {
      sub: merchant.id,
      walletAddress,
      userType: 'merchant',
    };

    return {
      access_token: this.jwtService.sign(payload),
      merchant,
      userType: 'merchant',
    };
  }

  async checkMerchant(walletAddress: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { walletAddress },
    });

    return {
      exists: !!merchant,
      merchant: merchant || null,
    };
  }

  async getMerchantByWallet(walletAddress: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { walletAddress },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant;
  }

  async checkUser(walletAddress: string) {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    return {
      exists: !!user,
      user: user || null,
    };
  }

  async getUserByWallet(walletAddress: string) {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
