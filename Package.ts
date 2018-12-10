export const enum PackageState {
	Confirmed,
	Buffered
}

export interface Package {
	sequence: number
}

export interface SenderPackage extends Package {
	state: PackageState
}