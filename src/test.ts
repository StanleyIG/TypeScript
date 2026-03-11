// interface Group {
//   group: number;
//   name: string;
// }

// const groups: Group[] = [
//   { group: 1, name: "a" },
//   { group: 1, name: "b" },
//   { group: 2, name: "c" },
// ];

// function group<T, K extends keyof T>(groups: T[], key: K) {
//   const result: Record<string, T[]> = {};
//   for (const item of groups) {
//     const k: string = String(item[key]);
//     if (!result[k]) {
//       result[k] = [item];
//     } else {
//       result[k].push(item);
//     }
//   }
//   return result;
// }

// const res = group(groups, "group");
// for (const k in res) {
//   console.log(k, res[k]);
// }


// interface Data {
//   group: number;
//   name: string;
// }

// const groups: Data[] = [
//   { group: 1, name: "a" },
//   { group: 1, name: "b" },
//   { group: 2, name: "c" },
// ];

// interface IGroup<T> {
//     [key: string]: T[]
// }

// type key = string | number | symbol;

// function group<T extends Record<key, any>>(array: T[], key: keyof T): IGroup<T> {
//     return array.reduce<IGroup<T>>((map: IGroup<T>, item) => {
//         const itemKey = String(item[key]);
//         let currEl = map[itemKey];
//         if (Array.isArray(currEl)) {
//             currEl.push(currEl)
//         } else {
//             currEl = [item]
//         }
//         map[itemKey] = currEl;
//         return map
//     }, {})
// }


interface Group {
  group: number;
  name: string;
}

const groups: Group[] = [
  { group: 1, name: "a" },
  { group: 1, name: "b" },
  { group: 2, name: "c" },
];

interface IGroup<T> {
    [key: string]: T[]
}

type key = string | number | symbol;

function group<T extends Record<key, any>>(array: T[], key: keyof T): Record<key, any> {
    return array.reduce<Record<key, any>>((map: IGroup<T>, item) => {
        const itemKey = item[key]
        let currEl = map[itemKey];
        if (Array.isArray(currEl)) {
            currEl.push(item);
        } else {
            currEl = [item];
            map[itemKey] = currEl;
        }
        
        return map;
    }, {});
}

// function group2<T extends Record<key, any>>(array: T[], key: keyof T): IGroup<T> {
//     return array.reduce<IGroup<T>>((map: IGroup<T>, item) => {
//         const itemKey = String(item[key]);
//         const currEl = map[itemKey];
//         if (Array.isArray(currEl)) {
//             currEl.push(item);
//         } else {
//             map[itemKey] = [item];
//         }
//         return map;
//     }, {});
// }

const grouped = group(groups, 'group');
console.log(grouped);

// const res = group(groups, "group");
// for (const k in res) {
//   console.log(k, res[k]);
// }
