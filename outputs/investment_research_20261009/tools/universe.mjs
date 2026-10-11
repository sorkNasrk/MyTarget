import fs from 'node:fs/promises';
const raw = `688139|海尔生物|医药设备
688062|迈威生物|创新药
688192|迪哲医药|创新药
688382|益方生物|创新药
688302|海创药业|创新药
002821.SZ|凯莱英|CXO
2172.HK|微创脑科学|医药设备
3696.HK|英矽智能|创新药AI
159502.SZ|嘉实标普生物科技精选行业ETF(QDII)|ETF
2252.HK|微创机器人-B|医药设备
603259|药明康德|CXO
600276|恒瑞医药|创新药
688235|百济神州|创新药
513290|汇添富纳斯达克生物科技ETF|ETF
300363.SZ|博腾股份|CXO
300760.SZ|迈瑞医疗|医药设备
688131|皓元医药|CXO
0853.HK|微创医疗|医药设备
688356|键凯科技|生物材料
688202|美迪西|CXO
987018.SZ|港股通创新药|指数
1276.HK|恒瑞医药|创新药
6699.HK|时代天使|医药设备
9606.HK|映恩生物-B|创新药
931787.CSI|港股创新药|指数
6855.HK|亚盛医药|创新药
3759.HK|康龙化成|CXO
1530.HK|三生制药|创新药
0013.HK|和黄医药|创新药
1093.HK|石药集团|综合药企
2157.HK|乐普生物|创新药
2228.HK|晶泰控股|创新药AI
2607.HK|上海医药|医药流通
3692.HK|翰森制药|创新药
2186.HK|绿叶制药|综合药企
1177.HK|中国生物制药|创新药
2359.HK|药明康德|CXO
0512.HK|远大医药|综合药企
2096.HK|先声药业|创新药
2269.HK|药明生物|CXO
1548.HK|金斯瑞生物科技|生物科技
1513.HK|丽珠医药|综合药企
6160.HK|百济神州|创新药
2511.HK|君圣泰医药-B|创新药
9939.HK|开拓药业-B|创新药
9688.HK|再鼎医药|创新药
1952.HK|云顶新耀|创新药
9969.HK|诺诚健华|创新药
6185.HK|康希诺生物|疫苗
2196.HK|复星医药|综合药企
3347.HK|泰格医药|CXO
6127.HK|昭衍新药|CXO
1877.HK|君实生物|创新药
2162.HK|康诺亚-B|创新药
1801.HK|信达生物|创新药
2268.HK|药明合联|CXO
6821.HK|凯莱英|CXO
0867.HK|康哲药业|综合药企
9995.HK|荣昌生物|创新药
9926.HK|康方生物|创新药
1763.HK|中国同辐|核医药
03442.HK|南方港美科技|ETF
07709.HK|XL二南方海力士|每日杠杆
0100.HK|MINIMAX-W|AI模型
2513.HK|智谱|AI模型
9992.HK|泡泡玛特|消费
1811.HK|中广核新能源|新能源运营
1797.HK|东方甄选|消费
9880.HK|优必选|机器人
2400.HK|心动公司|游戏
1211.HK|比亚迪股份|汽车
9660.HK|地平线机器人-W|智能驾驶
3750.HK|宁德时代|电池
9999.HK|网易|游戏
0992.HK|联想集团|硬件
9888.HK|百度集团-W|互联网AI
0241.HK|阿里健康|互联网医疗
6690.HK|海尔智家|家电
0522.HK|ASMPT|半导体设备
9618.HK|京东集团-SW|互联网消费
1347.HK|华虹宏力|半导体
HSTECH.HK|恒生科技|指数
0700.HK|腾讯控股|互联网游戏
9626.HK|哔哩哔哩-W|互联网内容
6618.HK|京东健康|互联网医疗
9988.HK|阿里巴巴-W|互联网AI
2382.HK|舜宇光学科技|光学
9961.HK|携程集团-S|旅游
3690.HK|美团-W|互联网消费
0772.HK|阅文集团|互联网内容
1024.HK|快手-W|互联网内容
0285.HK|比亚迪电子|硬件
0300.HK|美的集团|家电
6060.HK|众安在线|保险科技
2015.HK|理想汽车-W|汽车
9868.HK|小鹏集团-W|汽车
0780.HK|同程旅行|旅游
1810.HK|小米集团-W|硬件汽车
9866.HK|蔚来-SW|汽车
0020.HK|商汤-W|AI软件
0268.HK|金蝶国际|企业软件
3888.HK|金山软件|企业软件游戏
0981.HK|中芯国际|半导体`;
const names = new Map();
const securities = raw.split('\n').map((line,index)=>{
  const [originalCode,name,sector] = line.split('|');
  const type = ['ETF','指数','每日杠杆'].includes(sector)?sector:'股票';
  let code = originalCode;
  if (!code.includes('.')) code += code.startsWith('3')||code.startsWith('0')?'.SZ':'.SH';
  if (code.endsWith('.HK')&&code!=='HSTECH.HK') code = code.split('.')[0].padStart(5,'0')+'.HK';
  let issuerId = null;
  if(type==='股票') {if(!names.has(name)) names.set(name,`I${String(names.size+1).padStart(3,'0')}`);issuerId=names.get(name);}
  const yahoo = type==='指数' ? (code==='HSTECH.HK'?'^HSTECH':null) : code.endsWith('.HK')?`${String(Number(code.split('.')[0])).padStart(4,'0')}.HK`:code.replace('.SH','.SS');
  const tencent = type==='指数'?null:code.endsWith('.HK')?'hk'+code.split('.')[0]:code.endsWith('.SH')?'sh'+code.split('.')[0]:'sz'+code.split('.')[0];
  return {securityId:`S${String(index+1).padStart(3,'0')}`,issuerId,originalCode,code,name,sector,type,yahoo,tencent,currency:code.endsWith('.HK')?'HKD':'CNY'};
});
const issuers = [...names].map(([name,issuerId])=>({issuerId,name,sector:securities.find(x=>x.issuerId===issuerId).sector,securities:securities.filter(x=>x.issuerId===issuerId).map(x=>x.securityId)}));
if(securities.length!==103||issuers.length!==92) throw Error(`Count: ${securities.length}/${issuers.length}`);
const root = new URL('../',import.meta.url);
await fs.writeFile(new URL('data/universe.json',root),JSON.stringify({asOf:'2026-10-09',securities,issuers},null,2));
await fs.writeFile(new URL('data/research_status.json',root),JSON.stringify({asOf:'2026-10-09',scope:{securities:103,issuers:92},companies:issuers.map(x=>({...x,status:'pending',effectiveHanCharacters:0,valuationStatus:'pending',sourceStatus:'pending'}))},null,2));
console.log(JSON.stringify({securities:securities.length,issuers:issuers.length,byType:securities.reduce((a,s)=>(a[s.type]=(a[s.type]||0)+1,a),{})}));
