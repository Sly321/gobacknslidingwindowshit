const chalk = require("chalk")

function dropIt() {
	return Math.random() >= 0.5
}

const statistics = {
	sendTotal: 0,
	resend: 0,
	dropped: 0,
	ack: 0,
}

class Receiver {
	constructor() {
		this.lastSuccessFul = 0
	}

	send(dataPackage) {
		if (dropIt()) {
			statistics.dropped++
			throw ("")
		}

		return this.lastSuccessFul += this.lastSuccessFul + 1 === dataPackage
	}
}


class Sender {
	constructor(receiver, window = 5, total = 300) {
		this.base = 0
		this.next = 0
		this.receiver = receiver
		this.window = window
		this.total = total
	}

	start() {
		console.time("package-transmission")

		this.packageInterval = setInterval(() => {
			if (this.base === this.total) {
				return this.printStats() || clearInterval(this.packageInterval)
			}

			if (this.next - this.base < this.window && this.next <= this.total) {
				console.log(`> > > > Sender: Sending > { base: ${this.base}, next: ${this.next} }`)
				statistics.sendTotal++ // statistics
				this.send(++this.next)
			} else {
				statistics.resend += this.next - this.base // statistics
				this.next = this.base
			}
		}, 1000 / 83)
	}

	send(num) {
		try {
			const responseNumber = this.receiver.send(num)
			if (this.base < responseNumber) {
				this.base = responseNumber
			} else {
				statistics.resend += this.next - responseNumber // statistics
				statistics.ack++ // statistics
				this.next = responseNumber
			}
		} catch (_) { }
	}

	printStats() {
		console.log(chalk.bgGreen("< < < < < STATISTICS > > > > >"))
		console.log(chalk.red("sendTotal: " + statistics.sendTotal))
		console.log(chalk.red("resend: " + statistics.resend))
		console.log(chalk.red("dropped: " + statistics.dropped))
		console.log(chalk.red("ACK: " + statistics.ack))
		console.log(chalk.green("packages transfered: " + this.base))
		console.timeEnd("package-transmission")
		console.log(chalk.bgGreen("< < < < STATISTICS END > > > >"))
	}
}

const sender = new Sender(new Receiver())
sender.start()