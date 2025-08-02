import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, MerchantRegisterDto, CheckMerchantDto, MerchantResponseDto, CheckUserDto, UserResponseDto, RefreshTokenDto } from '../../dto/auth.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with wallet signature' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 401,
    description: 'Invalid signature or user not found',
  })
  async login(@Body() loginDto: LoginDto) {
    console.log("🔍 Backend: /auth/login endpoint hit")
    console.log("🔍 Backend: Request body:", {
      walletAddress: loginDto.walletAddress,
      hasSignature: !!loginDto.signature,
      hasMessage: !!loginDto.message
    })
    
    const result = await this.authService.login(loginDto);
    
    console.log("✅ Backend: /auth/login endpoint returning response")
    return result;
  }

  @Post('register/user')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 401, description: 'User already exists' })
  async registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('register/merchant')
  @ApiOperation({ summary: 'Register new merchant' })
  @ApiResponse({ status: 201, description: 'Merchant registered successfully' })
  @ApiResponse({ status: 401, description: 'Merchant already exists' })
  async registerMerchant(@Body() merchantRegisterDto: MerchantRegisterDto) {
    return this.authService.registerMerchant(merchantRegisterDto);
  }

  @Put('merchant/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update merchant status' })
  @ApiResponse({ status: 200, description: 'Merchant status updated successfully' })
  async updateMerchantStatus(
    @Body() updateStatusDto: { walletAddress: string; status: 'APPROVED' | 'REJECTED'; transactionHash?: string }
  ) {
    return this.authService.updateMerchantStatus(
      updateStatusDto.walletAddress,
      updateStatusDto.status,
      updateStatusDto.transactionHash
    );
  }

  @Post('register/merchant/token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register new merchant with existing token' })
  @ApiResponse({ status: 201, description: 'Merchant registered successfully' })
  @ApiResponse({ status: 401, description: 'Merchant already exists' })
  async registerMerchantWithToken(@Body() merchantData: any, @Request() req) {
    return this.authService.registerMerchantWithToken(merchantData, req.user);
  }

  @Post('check/merchant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if merchant is registered' })
  @ApiResponse({ status: 200, description: 'Merchant check completed' })
  async checkMerchant(@Body() checkMerchantDto: CheckMerchantDto) {
    return this.authService.checkMerchant(checkMerchantDto.walletAddress);
  }

  @Get('merchant/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated merchant profile (Protected)' })
  @ApiResponse({ status: 200, description: 'Merchant found', type: MerchantResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - user is not a merchant' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async getMerchantProfile(@Request() req) {
    return this.authService.getMerchantProfile(req.user);
  }

  @Get('merchant/:walletAddress/public')
  @ApiOperation({ summary: 'Get public merchant info by wallet address' })
  @ApiResponse({ status: 200, description: 'Merchant found' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async getPublicMerchantInfo(@Param('walletAddress') walletAddress: string) {
    return this.authService.getPublicMerchantInfo(walletAddress);
  }

  @Post('check/user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if user is registered' })
  @ApiResponse({ status: 200, description: 'User check completed' })
  async checkUser(@Body() checkUserDto: CheckUserDto) {
    return this.authService.checkUser(checkUserDto.walletAddress);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token with wallet signature' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async refreshToken(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.login(refreshDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Request() req) {
    // In a real implementation, you might add the token to a blacklist
    return { message: 'Logged out successfully' };
  }
}
