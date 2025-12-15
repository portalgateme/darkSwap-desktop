import { AssetPairDto, DarkSwapConfig } from '../types';
import { DatabaseService } from './db/database.service';
import axios from 'axios';

export class AssetPairService {
    private dbService: DatabaseService;
    private config: DarkSwapConfig;

    public constructor(config: DarkSwapConfig, dbService: DatabaseService) {
        this.dbService = dbService;
        this.config = config;
    }

    async syncAssetPairs() {
        console.log("Syncing asset pairs");
        const result =
            await axios.get(`${this.config.bookNodeApiUrl}/api/trading-pairs`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.bookNodeApiKey}`
                }
            });

        if (result.status == 200 && result.data.code == 200 && result.data.data) {
            const assetPairs = result.data.data as AssetPairDto[];
            for (const assetPair of assetPairs) {
                const assetPairDb = await this.dbService.getAssetPairById(assetPair.id, assetPair.chainId);
                if (!assetPairDb) {
                    await this.dbService.addAssetPair(assetPair);
                }
            }
        }
    }

    async syncAssetPair(assetPairId: string, chainId: number) {
        const result = await axios.get(`${this.config.bookNodeApiUrl}/assetPair/getAssetPair/${assetPairId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.bookNodeApiKey}`
            }
        });
        const assetPair = result.data as AssetPairDto;
        const assetPairDb = await this.dbService.getAssetPairById(assetPair.id, chainId);
        if (!assetPairDb) {
            await this.dbService.addAssetPair(assetPair);
        }
    }
}