import { PointsService } from './points.service';
import { IssuePointsDto, PointsTransactionResponseDto, UserBalanceResponseDto, MerchantBalanceResponseDto } from '../../dto/points.dto';
export declare class PointsController {
    private pointsService;
    constructor(pointsService: PointsService);
    issuePoints(req: any, issuePointsDto: IssuePointsDto): Promise<PointsTransactionResponseDto>;
    getUserBalance(req: any): Promise<UserBalanceResponseDto>;
    getMerchantBalance(req: any): Promise<MerchantBalanceResponseDto>;
    getUserTransactions(req: any): Promise<PointsTransactionResponseDto[]>;
    getMerchantTransactions(req: any): Promise<PointsTransactionResponseDto[]>;
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
