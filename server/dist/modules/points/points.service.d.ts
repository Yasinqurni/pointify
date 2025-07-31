import { PrismaService } from '../../common/prisma.service';
import { IssuePointsDto, PointsTransactionResponseDto, UserBalanceResponseDto, MerchantBalanceResponseDto } from '../../dto/points.dto';
export declare class PointsService {
    private prisma;
    constructor(prisma: PrismaService);
    issuePoints(merchantId: string, issuePointsDto: IssuePointsDto): Promise<PointsTransactionResponseDto>;
    getUserBalance(userId: string): Promise<UserBalanceResponseDto>;
    getMerchantBalance(merchantId: string): Promise<MerchantBalanceResponseDto>;
    getUserTransactions(userId: string): Promise<PointsTransactionResponseDto[]>;
    getMerchantTransactions(merchantId: string): Promise<PointsTransactionResponseDto[]>;
}
