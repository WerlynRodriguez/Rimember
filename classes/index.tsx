/** If size is more than maxRange, Randomizer will fragment the randomizer in parts of maxRange
 * @Example size = 500, randomizer will be divided in 2 parts of 300 and 1 of 200
 * The first 300 indexes will be in range of 0 to 299...
 */
const maxRange = 1000

const isSectionated = true

/** Manage random indexes and no repeting. And auto reset when all indexes are used */
export class Randomizer {
    length: number
    ranges: number
    indexes: number[]
    rnd: Generator<number, void, unknown>
    constructor(size = 1) {
        this.length = size
        this.ranges = 0

        if (isSectionated && size > maxRange) 
            this.indexes = Array.from({ length: maxRange }, (_, index) => index)
        else
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
            yield this.indexes[i] + this.ranges

            // pop the last index
            this.indexes.pop()
        }
        yield this.indexes[0] + this.ranges
    }

    getRandomIndex() : number | undefined {
        const { value, done } = this.rnd.next()

        if (!done) return value
        else return undefined

        // This reset automatically the randomizer

        // if (isSectionated && this.length > maxRange) { // Sectionated randomizer
        //     // Reset sectionated randomizer
        //     if (this.ranges + maxRange >= this.length) this.ranges = 0
        //     else this.ranges += maxRange

        //     // Check the new Length
        //     const newLength = this.length - this.ranges
        //     if (newLength > maxRange) this.indexes = Array.from({ length: maxRange }, (_, index) => index)
        //     else this.indexes = Array.from({ length: newLength }, (_, index) => index)
        // }

        // this.rnd = this.generateRandomIndexes()
        // return this.rnd.next().value ?? 0
    }

}