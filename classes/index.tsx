/** Manage random indexes and no repeting. And auto reset when all indexes are used */
export class Randomizer {
    length: number
    indexes: number[]
    rnd: Generator<number, void, unknown>
    constructor(size = 1) {
        this.length = size
        this.indexes = Array.from({ length: size }, (_, index) => index)
        this.rnd = this.generateRandomIndexes()
    }

    *generateRandomIndexes(): Generator<number, void, unknown> {
        for (let i = this.indexes.length - 1; i > 0; i--) {
            // Hero choose a random index from 0 to i
            const randomIndex = Math.floor(Math.random() * (i + 1));

            /** Swap elements indexes[i] and indexes[randomIndex]
             * @example indexes = [0, 1, 2, 3, 4, 5]
             * i = 5, randomIndex = 2
             * indexes = [0, 1, 5, 3, 4, 2]
             * i = 4, randomIndex = 1
             * indexes = [0, 4, 5, 3, 1, 2]
             **/
            [this.indexes[i], this.indexes[randomIndex]] = [this.indexes[randomIndex], this.indexes[i]]

            // Return the random index
            yield this.indexes[i]

            // pop the last index
            this.indexes.pop()
        }
        yield this.indexes[0]

        this.indexes.pop()
    }

    getRandomIndex() : number | undefined {
        const { value, done } = this.rnd.next()

        if (!done) return value
        else return undefined
    }

}