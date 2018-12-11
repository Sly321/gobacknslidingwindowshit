import chalk from "chalk"

function dropIt(): boolean {
	return Math.random() <= 0.5
}

export class Receiver {
	private lastSuccessFul: number = -1
	public send(dataPackage: number): number {
		if (dropIt()) {
			console.log(`< < < < ${chalk.red("Rejected")}: ${dataPackage}, lastSuccessful: ${chalk.magenta("" + this.lastSuccessFul)}`)
			throw (this.lastSuccessFul)
		}

		if (this.isNext(dataPackage)) {
			console.log(`< < < < ${chalk.green("Confirmed")}: ` + dataPackage)
			return this.lastSuccessFul = dataPackage
		} else {
			console.log(`< < < < ${chalk.yellow("IS NOT NEXT")}: ` + dataPackage)
			return this.lastSuccessFul
		}
	}

	private isNext(sequence: number) {
		return this.lastSuccessFul + 1 === sequence
	}
}


export class Sender {
	private base: number = 0
	private next: number = 0
	private interval: number
	// private framesPerSecond: number = 1000 / 83

	constructor(private receiver: Receiver, private window: number = 5, private timeout: number = 11000) { }

	public start() {
		clearInterval(this.interval)

		while (this.next - this.base < this.window) {
			console.log(`> > > > Sender: Sending > ${this.toString()}`)
			this.send(this.next++)
		}

		this.interval = setInterval(() => {
			this.next = this.base // reset
			console.log(`TIMEOUT TIMEOUT ----- > > > > Sender: timeout > ${this.toString()}`)
			this.start()
		}, this.timeout)
	}

	private send(num: number) {
		try {
			const responseNumber = this.receiver.send(num)
			if (this.base === responseNumber) {
				this.base++ // das bestätigte paket war die base
			} else {
				console.log(`> > > > Sender: Next Resetted ${responseNumber}`)
				this.next = responseNumber + 1 // ein paket ging verloren
			}

			this.start()

		} catch (_) { }
	}

	public toString(): string {
		return `{ base: ${this.base}, next: ${this.next} }`
	}
}

const sender = new Sender(new Receiver())
sender.start()