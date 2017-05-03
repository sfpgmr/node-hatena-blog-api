'use strict'
// 1
{
  // オブジェクト
  const a = {
    b: 1,
    c: 2,
    d: 3
  };

  {

    // 1-1 代入する値の順番を入れ替えるどうなる？
    const { c, d, b } = a;
    console.log('1-1:', b, c, d);
    // 1 2 3 
    // ちゃんとしていたプロパティ名と一致する変数に値が代入される
  }

  // 1-2じゃこれは？
  {
    const { b: c, c: d, d: b } = a;
    console.log('1-2:', b, c, d);
    // 3 1 2 
  }
}

// その2
{
  const a = {
    b: 1,
    c: 2
  }
  // 関数の引数としての分割代入
  function f({ b, c, d = 3 }, sectionNo) {
    console.log(`${sectionNo}:`, b, c, d);
  }
  f(a, '2-1');
  // 1 2 3
  // 未定義のプロパティは既定値が代入される

  a.d = undefined;
  f(a, '2-2');
  // 1 2 3
  // undefinedだと既定値が代入される

  a.d = null;
  f(a, '2-3');
  // 1 2 null
  // nullだと既定値が代入されない
  // なので引数のnullチェックは必要
}

{
  function f(a = 1){
    console.log(a);
  }

  f('');

  f();

}

function pad(n){
  return ('0' + n).slice(-2);
}

function toISOString(d = new Date()){
  let timezoneOffset = d.getTimezoneOffset();
  let hour = Math.abs(timezoneOffset / 60) | 0;
  let minutes = Math.abs(timezoneOffset % 60);
  let tzstr = 'Z';
  if(timezoneOffset < 0){
    tzstr = `+${pad(hour)}:${pad(minutes)}`;
  } else {
    tzstr = `-${pad(hour)}:${pad(minutes)}`;
  }
  console.log(timezoneOffset);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}${tzstr}`;
}

console.log(toISOString());
