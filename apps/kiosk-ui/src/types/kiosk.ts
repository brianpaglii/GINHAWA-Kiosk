export type KioskState =
    | 'IDLE'
    | 'AUTH'
    | 'DASHBOARD'
    | 'MEASURING_BP'
    | 'MEASURING_BP_LIVE'
    | 'MEASURING_SPO2'
    | 'MEASURING_SPO2_LIVE'
    | 'MEASURING_WEIGHT'
    | 'MEASURING_WEIGHT_LIVE'
    | 'MEASURING_HEIGHT'
    | 'MEASURING_HEIGHT_LIVE'
    | 'MEASURING_TEMP'
    | 'MEASURING_TEMP_LIVE'
    | 'RESULTS'
    | 'PRINTING';

export interface Citizen {
    id: string;
    full_name: string;
    rfid_uid: string;
}

export interface Measurement {
    type: string;
    value: string;
    unit: string;
}

export interface Session {
    id: string;
    started_at: string;
    measurements: Measurement[];
}
