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
    console.log("🔍 Backend login called with walletAddress:", loginDto.walletAddress)
    console.log("🔍 Backend login data:", {
      walletAddress: loginDto.walletAddress,
      hasSignature: !!loginDto.signature,
      hasMessage: !!loginDto.message
    })
    
    const { walletAddress, signature, message } = loginDto;

    // Validate wallet signature
    console.log("🔍 Backend: Validating wallet signature...")
    const isValidSignature = await this.validateWalletSignature(
      walletAddress,
      message,
      signature,
    );
    console.log("🔍 Backend: Signature validation result:", isValidSignature)
    
    if (!isValidSignature) {
      console.log("❌ Backend: Invalid wallet signature")
      throw new UnauthorizedException('Invalid wallet signature');
    }

    // Only check for merchant - no user logic
    console.log("🔍 Backend: Searching for merchant in database...")
    const merchant = await this.prisma.merchant.findUnique({
      where: { walletAddress },
    });
    console.log("🔍 Backend: Merchant found:", !!merchant)

    if (!merchant) {
      console.log("❌ Backend: No merchant found")
      throw new UnauthorizedException('Merchant not found');
    }

    const payload = {
      sub: merchant.id,
      walletAddress,
      userType: 'merchant',
    };
    
    console.log("🔍 Backend: Creating JWT payload:", payload)

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload)
    
    console.log("🔍 Backend: Tokens generated:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      userType: 'merchant'
    })

    const response = {
      accessToken,
      refreshToken,
      user: merchant,
      userType: 'merchant',
    };
    
    console.log("✅ Backend: Login successful, returning response")
    return response;
  }

  async registerMerchant(merchantRegisterDto: MerchantRegisterDto) {
    const { walletAddress, signature, message, name, description, logoUrl } = merchantRegisterDto;

    // Validate wallet signature
    const isValidSignature = await this.validateWalletSignature(
      walletAddress,
      message,
      signature,
    );
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid wallet signature');
    }

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
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload),
      user: merchant,
      userType: 'merchant',
    };
  }

  async registerMerchantWithToken(merchantData: any, user: any) {
    const { name, description, logoUrl } = merchantData;
    const walletAddress = user.walletAddress;

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
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload), // For now, using same token as refresh
      user: merchant, // Use 'user' field for consistency
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

  async updateMerchantStatus(walletAddress: string, status: 'APPROVED' | 'REJECTED', transactionHash?: string) {
    const merchant = await this.prisma.merchant.update({
      where: { walletAddress },
      data: {
        status,
        transactionHash,
      },
    });

    return merchant;
  }

  async getMerchantProfile(user: any) {
    // Check if user is a merchant
    if (user.userType !== 'merchant') {
      throw new UnauthorizedException('Access denied. User is not a merchant.');
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { walletAddress: user.walletAddress },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant;
  }

  async getPublicMerchantInfo(walletAddress: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { walletAddress },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        walletAddress: true,
        createdAt: true,
        // Exclude sensitive fields like internal IDs, etc.
      },
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

  async registerUser(registerDto: RegisterDto) {
    const { walletAddress, signature, message } = registerDto;

    // Validate wallet signature
    const isValidSignature = await this.validateWalletSignature(
      walletAddress,
      message,
      signature,
    );
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid wallet signature');
    }

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: { walletAddress },
      });
    }

    const payload = {
      sub: user.id,
      walletAddress,
      userType: 'user',
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        userType: 'user',
      },
    };
  }
}
