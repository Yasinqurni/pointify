import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param, UseGuards, Request } from '@nestjs/common';
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
    return this.authService.login(loginDto);
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

  @Post('check/merchant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if merchant is registered' })
  @ApiResponse({ status: 200, description: 'Merchant check completed' })
  async checkMerchant(@Body() checkMerchantDto: CheckMerchantDto) {
    return this.authService.checkMerchant(checkMerchantDto.walletAddress);
  }

  @Get('merchant/:walletAddress')
  @ApiOperation({ summary: 'Get merchant by wallet address' })
  @ApiResponse({ status: 200, description: 'Merchant found', type: MerchantResponseDto })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async getMerchantByWallet(@Param('walletAddress') walletAddress: string) {
    return this.authService.getMerchantByWallet(walletAddress);
  }

  @Post('check/user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if user is registered' })
  @ApiResponse({ status: 200, description: 'User check completed' })
  async checkUser(@Body() checkUserDto: CheckUserDto) {
    return this.authService.checkUser(checkUserDto.walletAddress);
  }

  @Get('user/:walletAddress')
  @ApiOperation({ summary: 'Get user by wallet address' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByWallet(@Param('walletAddress') walletAddress: string) {
    return this.authService.getUserByWallet(walletAddress);
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
