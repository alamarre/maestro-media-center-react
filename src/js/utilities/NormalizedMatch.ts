export default function (n1: string, n2: string) {
  if (typeof n1 !== "string" || typeof n2 !== "string") {
    return false;
  }
  const reg = /([;:\-.]|the[ ]|an?[ ])/g;
  n1 = n1.toLowerCase().replace(reg, "").replace(/  +/g, " ");
  n2 = n2.toLowerCase().replace(reg, "").replace(/  +/g, " ");
  return n1 === n2;
}
