const maxLength = 999

/** Manage random indexes for no repeting*/
export class Randomizer {
    length: number
    /** Matrix of indexes */
    indexes: number[][]
    rnds: Generator<number, void, unknown>[]
    constructor(size = 1) {
        this.length = size
        const sections = Math.ceil(this.length / maxLength)

        this.rnds = [...Array(sections)].map((_, i) => this.generateRandomIndexes(i))

        /* Create a matrix of indexes
        * @example length = 1000, maxLength = 999
        * The last array will have the rest of the division 
        **/
        this.indexes = [...Array(sections)].map((_, i) => 
            [...Array(sections === i + 1 ? this.length % maxLength : maxLength).keys()])
    }

    *generateRandomIndexes(section: number): Generator<number, void, unknown> {
        for (let i = this.indexes[section].length - 1; i > 0; i--) {
            // choose a random index from 0 to i
            const randomIndex = Math.floor(Math.random() * (i + 1));

            /** Swap elements indexes[i] and indexes[randomIndex]
             * @example indexes = [0, 1, 2, 3, 4, 5]
             * i = 5, randomIndex = 2
             * indexes = [0, 1, 5, 3, 4, 2]
             * i = 4, randomIndex = 1
             * indexes = [0, 4, 5, 3, 1, 2]
             **/
            [this.indexes[section][i], this.indexes[section][randomIndex]] = 
            [this.indexes[section][randomIndex], this.indexes[section][i]]

            // Return the random index
            yield this.indexes[section][i] + (section * maxLength)

            // pop the last index
            this.indexes[section].pop()
        }
        yield this.indexes[section][0] + (section * maxLength)

        this.indexes[section].pop()
    }

    getRandomIndex() : number | undefined {
        const section = Math.floor(Math.random() * this.rnds.length)
        const { value, done } = this.rnds[section].next()

        if (!done) return value
        else {
            if (this.rnds.length === 1) return undefined

            // Delete the randomizer of the section
            this.rnds.splice(section, 1)
            // Delete the indexes of the section
            this.indexes.splice(section, 1)

            return this.getRandomIndex()
        }
    }
}