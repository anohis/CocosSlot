export function Zip<T, U>(array1: ReadonlyArray<T>, array2: ReadonlyArray<U>): [T, U][]
{
    const length = Math.min(array1.length, array2.length);
    const result: [T, U][] = [];

    for (let i = 0; i < length; i++)
    {
        result.push([array1[i], array2[i]]);
    }
    return result;
}