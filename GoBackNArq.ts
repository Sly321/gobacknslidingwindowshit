import chalk from "chalk"

function dropIt(): boolean {
	return Math.random() >= 0.5
}

const statistics = {
	sendTotal: 0,
	resend: 0,
	dropped: 0,
	ack: 0,
}

export class Receiver {
	private lastSuccessFul: number = 0
	public send(dataPackage: number): number {
		if (dropIt()) {
			console.log(`< < < < ${chalk.red("Rejected")}: ${dataPackage}, lastSuccessful: ${chalk.magenta("" + this.lastSuccessFul)}`)
			statistics.dropped++
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
	private packageInterval: number
	private framesPerSecond: number = 1000 / 83

	constructor(private receiver: Receiver, private window: number = 5, private total: number = 300) { }

	public start() {
		console.time("package-transmission")

		this.packageInterval = setInterval(() => {
			if (this.base === this.total) {
				return this.printStats() || clearInterval(this.packageInterval) // damit will ich nur ärgern
			}

			if (this.next - this.base < this.window && this.next <= this.total) {
				console.log(`> > > > Sender: Sending > ${this.toString()}`)
				statistics.sendTotal++ // statistics
				this.send(++this.next)
			} else {
				// something went completly wrong, everything in window range was dropped
				statistics.resend += this.next - this.base // statistics
				this.next = this.base // reset
			}
		}, this.framesPerSecond)
	}

	private send(num: number) {
		try {
			const responseNumber = this.receiver.send(num)
			if (this.base < responseNumber) {
				this.base = responseNumber // die response ist weiter
			} else {
				// simulated, the receiver asks for a new package of number .. because he send an package that is lower than base
				// my english sucks
				statistics.resend += this.next - responseNumber // statistics
				statistics.ack++ // statistics
				this.next = responseNumber
			}
		} catch (_) { }
	}

	public toString(): string {
		return `{ base: ${this.base}, next: ${this.next} }`
	}

	// statistics
	// statistics
	// statistics
	private printStats() {
		console.log(chalk.bgGreen("< < < < < STATISTICS > > > > >"))
		console.log(chalk.red("sendTotal: " + statistics.sendTotal))
		console.log(chalk.red("resend: " + statistics.resend))
		console.log(chalk.red("dropped: " + statistics.dropped))
		console.log(chalk.red("ACK: " + statistics.ack))
		console.log(chalk.green("packages transfered: " + this.base))
		console.timeEnd("package-transmission")
		console.log(chalk.bgGreen("< < < < STATISTICS END > > > >"))
		return false
	}
}

const sender = new Sender(new Receiver())
sender.start()