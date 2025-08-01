import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IssuePointsDto, PointsTransactionResponseDto, UserBalanceResponseDto, MerchantBalanceResponseDto } from '../../dto/points.dto';
export declare class PointsService {
    private prisma;
    private blockchainService;
    constructor(prisma: PrismaService, blockchainService: BlockchainService);
    issuePoints(merchantId: string, issuePointsDto: IssuePointsDto): Promise<PointsTransactionResponseDto>;
    getUserBalance(userId: string, walletAddress?: string): Promise<UserBalanceResponseDto>;
    getMerchantBalance(merchantId: string): Promise<MerchantBalanceResponseDto>;
    getUserTransactions(userId: string): Promise<PointsTransactionResponseDto[]>;
    getMerchantTransactions(merchantId: string): Promise<PointsTransactionResponseDto[]>;
    getUserPointReceptionLogs(userId: string): Promise<{
        id: string;
        userId: string;
        merchantName: string;
        pointsReceived: number;
        receivedDate: string;
        transactionHash: string;
    }[]>;
    getUserLoyaltyDetails(userAddress: string, merchantAddress: string): Promise<{
        merchantName: string;
        userPoints: number;
        rewards: {
            id: string;
            name: string;
            pointsRequired: number;
            description: string;
            imageUrl: string;
        }[];
    } | null>;
}
