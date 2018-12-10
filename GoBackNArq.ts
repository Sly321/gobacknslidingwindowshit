import { Package } from "./Package"

export class Receiver {
	private _lastSuccessfulPackage: Package
	private failed: boolean = false

	public send(dataPackage: Package): Promise<Package> {
		// DEBUG
		if (dataPackage.sequence === 2 && !this.failed) {
			this.failed = true
			return Promise.reject(dataPackage.sequence)
		}

		return new Promise((res, rej) => {
			console.log(`Receiver: receive > ${dataPackage.sequence}`)
			setTimeout(() => {
				// if it is really the next data package
				if (dataPackage.sequence === this.lastSequence + 1) {
					// use setter
					console.log(`Receiver: Success > last package was: ${this.lastSequence}`)
					console.log(`Receiver: Success > new is: ${dataPackage.sequence}`)
					this.lastSuccessfulPackage = dataPackage
					res(dataPackage)
				}
			}, 3000)
		})
	}

	private set lastSuccessfulPackage(pkg: Package) {
		this._lastSuccessfulPackage = pkg
	}

	private get lastSequence(): number {
		return this._lastSuccessfulPackage ? this._lastSuccessfulPackage.sequence : -1
	}
}

export class Sender {
	private base: number = 0
	private next: number = 0
	private interval: number

	constructor(private receiver: Receiver, private window: number = 5, private timeout: number = 11000) { }

	public start() {
		clearInterval(this.interval)

		while (this.next - this.base < this.window) {
			this.send(this.next++)
		}

		console.log(`Sender: waiting... > ${this.toString()}`)

		this.interval = setInterval(() => {
			this.next = this.base // reset
			console.log(`Sender: timeout > ${this.toString()}`)
			this.start()
		}, this.timeout)
	}

	private send(num: number) {
		const dataPackage: Package = {
			sequence: num
		}

		console.log(`Sender: Sending > ${this.toString()}`)

		this.receiver.send(dataPackage)
			.then(pkg => {
				if (this.base === pkg.sequence) {
					this.base++ // das bestätigte paket war die base
				} else {
					this.next = pkg.sequence + 1 // ein paket ging verloren
				}

				console.log(`Sender: Confirmed > ${this.toString()}`)

				this.start()
			})
			.catch((e) => console.log("DEBUG: Rejected " + e))
	}

	public toString(): string {
		return `{ base: ${this.base}, next: ${this.next} }`
	}
}

const sender = new Sender(new Receiver())
sender.start()