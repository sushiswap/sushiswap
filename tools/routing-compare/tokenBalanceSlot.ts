import { Address, Hex, keccak256 } from 'viem'

type RawSlotInfo =
  | [Address]
  | [Address, number, number]
  | [Address, Address, number, number]

const balanceSlotInfo: RawSlotInfo[] = [
  ['0x6B175474E89094C44Da98b954EedeAC495271d0F', 2, 0],
  ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 9, 0],
  ['0xdAC17F958D2ee523a2206206994597C13D831ec7', 2, 0],
  ['0x028171bCA77440897B824Ca71D1c56caC55b68A3', 52, 0],
  ['0xBcca60bB61934080951369a648Fb03DF4F96263C', 52, 0],
  ['0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811', 52, 0],
  ['0xE95A203B1a91a908F9B9CE46459d101078c2c3cb', 151, 0],
  ['0xC2cB1040220768554cf699b0d863A3cd4324ce32', 0, 0],
  ['0x26EA744E5B887E5205727f55dFBE8685e3b21951', 0, 0],
  ['0xE6354ed5bC4b393a5Aad09f21c46E101e692d447', 0, 0],
  ['0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE', 0, 0],
  ['0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 14, 0],
  ['0x39AA39c021dfbaE8faC545936693aC917d5E7563', 15, 0],
  ['0xdB25f211AB05b1c97D595516F45794528a807ad8', 0, 0],
  [
    '0xD71eCFF9342A5Ced620049e616c5035F1dB98620',
    '0x6568D9e750fC44AF00f857885Dfb8281c00529c4',
    3,
    0,
  ],
  [
    '0x0316EB71485b0Ab14103307bf65a021042c6d380',
    '0xc728693dcf6b257bf88577d6c92e52028426eefd',
    4,
    0,
  ],
  ['0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 0, 0],
  ['0x8e595470Ed749b85C6F7669de83EAe304C2ec68F', 14, 0],
  ['0x76Eb2FE28b36B3ee97F3Adae0C69606eeDB2A37c', 14, 0],
  ['0x48759F220ED983dB51fA7A8C0D2AAb8f3ce4166a', 14, 0],
  ['0x514910771AF9Ca656af840dff83E8264EcF986CA', 1, 0],
  [
    '0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6',
    '0x577D4a7395c6A5f46d9981a5F83fa7294926aBB0',
    3,
    0,
  ],
  ['0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc', 0, 0],
  ['0x9777d7E2b60bB01759D0E2f8be2095df444cb07E', 0, 0],
  ['0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59', 0, 0],
  ['0x8E870D67F660D95d5be530380D0eC0bd388289E1', 1, 0],
  ['0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D', 102, 0],
  ['0x6C5024Cd4F8A59110119C56f8933403A539555EB', 52, 0],
  [
    '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    '0x4F6296455F8d754c19821cF1EC8FeBF2cD456E67',
    3,
    0,
  ],
  [
    '0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb',
    '0x34A5ef81d18F3a305aE9C2d7DF42beef4c79031c',
    3,
    0,
  ],
  ['0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', 0, 0],
  [
    '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
    '0x05a9CBe762B36632b3594DA4F082340E0e5343e8',
    3,
    0,
  ],
  ['0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01', 0, 0],
  ['0xd6aD7a6750A7593E092a9B218d66C0A814a3436e', 0, 0],
  ['0x83f798e925BcD4017Eb265844FDDAbb448f1707D', 0, 0],
  ['0x73a052500105205d34Daf004eAb301916DA8190f', 0, 0],
  ['0x5BC25f649fc4e26069dDF4cF4010F9f706c23831', 0, 0],
  ['0x5f98805A4E8be255a32880FDeC7F6728C6568bA0', 2, 0],
  ['0x0000000000085d4780B73119b644AE5ecd22b376', 14, 0],
  ['0x853d955aCEf822Db058eb8505911ED77F175b99e', 0, 0],
  ['0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9', 1, 0],
  ['0x4Fabb145d64652a948d72533023f6E7A623C7C53', 1, 0],
  [
    '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
    '0xc42B14e49744538e3C239f8ae48A1Eaaf35e68a0',
    6,
    0,
  ],
  ['0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3', 0, 0],
  ['0xe2f2a5C287993345a840Db3B0845fbC70f5935a5', 51, 0],
  ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 3, 0],
  ['0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490', 3, 1],
  ['0xD533a949740bb3306d119CC777fa900bA034cd52', 3, 1],
  ['0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7', 0, 0],
  ['0xFCc5c47bE19d06BF83eB04298b026F81069ff65b', 5, 1],
  ['0x836A808d4828586A69364065A1e064609F5078c7', 2, 0],
  ['0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5', 0, 0],
  ['0x64351fC9810aDAd17A690E4e1717Df5e7e085160', 3, 0],
  ['0x5E8422345238F34275888049021821E8E08CAa1f', 0, 0],
  ['0x9559Aaa82d9649C7A7b220E7c461d2E74c9a3593', 2, 0],
  ['0xC581b735A1688071A1746c968e0798D642EDE491', 101, 0],
  ['0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E', 1, 1],
  ['0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f', 3, 0],
  ['0x8D6CeBD76f18E1558D4DB88138e2DeFB3909fAD6', 1, 0],
  ['0xd7C9F0e536dC865Ae858b0C0453Fe76D13c3bEAc', 1, 0],
  ['0xb40b6608B2743E691C9B54DdBDEe7bf03cd79f1c', 3, 0],
  ['0x865377367054516e17014CcdED1e7d814EDC9ce4', 6, 0],
  ['0x18084fbA666a33d37592fA2633fD49a74DD93a88', 1, 0],
  ['0x4591DBfF62656E7859Afe5e45f6f47D3669fBB28', 7, 0],
  ['0x83F20F44975D03b1b09e64809B757c47f942BEeA', 1, 0],
  ['0x25eC98773D7b4ceD4cAFaB96A2A1c0945f145e10', 4, 0],
  ['0xa774FFB4AF6B0A91331C084E1aebAE6Ad535e6F3', 1, 0],
  ['0x71dF9Dd3e658f0136c40E2E8eC3988a5226E9A67', 1, 0],
  ['0x4206Fc377c22eB4778B5DAc3C28d0fa92db43AE4', 1, 0],
  ['0x575990152169e1C1a4867E81C6AE662caEf068fd', 1, 0],
  ['0x25de492f43661Af568f46C0a3F39850Aa1D066A0', 1, 0],
  ['0xdF574c24545E5FfEcb9a659c229253D4111d87e1', 1, 0],
  ['0x0E2EC54fC0B509F445631Bf4b91AB8168230C752', 0, 0],
  ['0x1c48f86ae57291F7686349F12601910BD8D470bb', 1, 0],
  ['0x674C6Ad92Fd080e4004b2312b45f796a192D27a0', 5, 0],
  ['0x1456688345527bE1f37E9e627DA0837D6f08C925', 2, 0],
  ['0xa47c8bf37f92aBed4A126BDA807A7b7498661acD', 0, 0],
  ['0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541', 0, 0],
  ['0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3', 3, 1],
  [
    '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
    '0xb8bf093045d5f2e4aac9062bd11a8f599f6565b5',
    3,
    0,
  ],
  ['0x8064d9Ae6cDf087b1bcd5BDf3531bD5d8C537a68', 0, 0],
  ['0x5228a22e72ccC52d415EcFd199F99D0665E7733b', 0, 0],
  ['0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa', 3, 0],
  ['0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919', 6, 0],
  ['0xa693B19d2931d498c5B318dF961919BB4aee87a5', 5, 0],
  ['0xa2E3356610840701BDf5611a53974510Ae27E2e1', 9, 0],
  ['0x96E61422b6A9bA0e068B6c5ADd4fFaBC6a4aae27', 6, 0],
  ['0x7409856CAE628f5d578B285B45669b36E7005283', 0, 0],
  ['0x95dFDC8161832e4fF7816aC4B6367CE201538253', 6, 0],
  [
    '0x269895a3dF4D73b077Fc823dD6dA1B95f72Aaf9B',
    '0x93B6e9FbBd2c32a0DC3C2B943B7C3CBC2fE23730',
    3,
    0,
  ],
  ['0x00000000441378008EA67F4284A57932B1c000a5', 14, 0],
  ['0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a', 4, 1],
  ['0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F', 0, 0],
  [
    '0xD38aEb759891882e78E957c80656572503D8c1B1',
    '0x602590F2aa35B71ccB1Ca72E673A75b26eC7f4E8',
    3,
    0,
  ],
  ['0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86'],
  ['0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 0, 0],
  ['0x810c4b2A31665ef77b75D2410ACeb29F0F099096', 0, 0],
  ['0x3fa372155439e9150a99D86A1de93a92F26b00C8', 0, 0],
  ['0xe7D18f2507869280111025F4938376846e8ad11A', 0, 0],
  ['0xB556Bb40E40f4AF34d9eea04d2fF7DB2674939BB', 0, 0],
  ['0x1BEf2e5DE862034Fb0ed456DF59d29Ecadc9934C', 1, 0],
  ['0x31d4Eb09a216e181eC8a43ce79226A487D6F0BA9', 0, 0],
  ['0xc2db4c131ADaF01c15a1DB654c040c8578929D55', 1, 0],
  ['0xfd8e70e83E399307db3978D3F34B060a06792c36', 1, 0],
  ['0x5555f75e3d5278082200Fb451D1b6bA946D8e13b', 6, 0],
  [
    '0xF6b1C627e95BFc3c1b4c9B825a032Ff0fBf3e07d',
    '0x4dFACfB15514C21c991ff75Bc7Bf6Fb1F98361ed',
    3,
    0,
  ],
  ['0xFAFdF0C4c1CB09d430Bf88c75D88BB46DAe09967', 6, 0],
  [
    '0xF48e200EAF9906362BB1442fca31e0835773b8B4',
    '0xCb29D2cf2C65d3Be1d00F07f3441390432D55203',
    3,
    0,
  ],
  ['0x69681f8fde45345C3870BCD5eaf4A05a60E7D227', 6, 0],
  [
    '0x97fe22E7341a0Cd8Db6F6C021A24Dc8f4DAD855F',
    '0x7e88D19A79b291cfE5696d496055f7e57F537A75',
    3,
    0,
  ],
  ['0x1CC481cE2BD2EC7Bf67d1Be64d4878b16078F309', 6, 0],
  [
    '0x0F83287FF768D1c1e17a42F44d644D7F22e8ee1d',
    '0x52496fE8a4feaEFe14d9433E00D48E6929c13deC',
    3,
    0,
  ],
  ['0x69e8b9528CABDA89fe846C67675B5D73d463a916', 1, 0],
  ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', 0, 0],
  ['0x9fcf418B971134625CdF38448B949C8640971671', 5, 0],
  ['0x478bBC744811eE8310B461514BDc29D03739084D', 5, 0],
  ['0x9C32185b81766a051E08dE671207b34466DD1021', 51, 0],
  ['0xF0a93d4994B3d98Fb5e3A2F90dBc2d69073Cb86b', 0, 0],
  ['0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6', 1, 0],
  ['0xc4AD29ba4B3c580e6D59105FFf484999997675Ff', 2, 1],
  ['0x332E824e46FcEeB9E59ba9491B80d3e6d42B0B59', 0, 0],
  ['0xEF779cf3D260dBE6177b30ff08b10Db591a6Dd9C', 0, 0],
  ['0x42ef9077d8e79689799673ae588E046f8832CB95', 1, 0],
  ['0x4185cf99745B2a20727B37EE798193DD4a56cDfa', 0, 0],
  ['0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', 0, 0],
  ['0x898BAD2774EB97cF6b94605677F43b41871410B1', 4, 0],
  ['0x8b921e618dD3Fa5a199b0a8B7901f5530D74EF27', 4, 0],
  ['0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', 0, 0],
  ['0xfd05D3C7fe2924020620A8bE4961bBaA747e6305', 51, 0],
  ['0x605D26FBd5be761089281d5cec2Ce86eeA667109', 4, 0],
  ['0xD01ef7C0A5d8c432fc2d1a85c66cF2327362E5C6'],
  ['0x99534Ef705Df1FFf4e4bD7bbaAF9b0dFf038EbFe', 101, 0],
  ['0x8751D4196027d4e6DA63716fA7786B5174F04C15', 51, 0],
  ['0x116172B2482c5dC3E6f445C16Ac13367aC3FCd35', 1, 0],
  ['0xe1406825186D63980fd6e2eC61888f7B91C4bAe4', 101, 0],
  ['0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8', 51, 0],
  ['0x8CB24ed2e4f7e2065f4eB2bE5f6B0064B1919850', 0, 0],
  ['0x81d66D255D47662b6B16f3C5bbfBb15283B05BC2', 6, 0],
  ['0x92D6C1e31e14520e676a687F0a93788B716BEff5', 0, 0],
  ['0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36', 51, 0],
  ['0xc7D9c108D4E1dD1484D3e2568d7f74bfD763d356', 0, 0],
  ['0x573d2505a7ee69D136A8667b4Cd915f039AC54e5', 3, 0],
  ['0xCF178A685471927E977a0EA8Ee555C11B2Aa6b7b', 51, 0],
  ['0xb8919522331C59f5C16bDfAA6A121a6E03A91F62', 51, 0],
  ['0x2370f9d504c7a6E775bf6E14B3F12846b594cD53', 0, 0],
  ['0x683923dB55Fead99A79Fa01A27EeC3cB19679cC3', 52, 0],
  ['0x9E0441E084F5dB0606565737158aa6Ab6B970fE0', 1, 0],
  ['0x0a5E677a6A24b2F1A2Bf4F3bFfC443231d2fDEc8', 52, 0],
  ['0x94671A3ceE8C7A12Ea72602978D1Bb84E920eFB2', 51, 0],
  ['0xDC59ac4FeFa32293A95889Dc396682858d52e5Db', 1, 0],
  ['0xea3Fb6f331735252E7Bfb0b24b3B761301293DBe', 0, 0],
  ['0x68037790A0229e9Ce6EaA8A99ea92964106C4703', 0, 0],
  ['0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0', 6, 0],
  ['0x2Fc6e9c1b2C07E18632eFE51879415a580AD22E1', 51, 0],
  ['0x6BeA7CFEF803D1e3d5f7C0103f7ded065644e197', 0, 0],
  ['0xeff721Eae19885e17f5B80187d6527aad3fFc8DE', 51, 0],
  [
    '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    '0x5b1b5fEa1b99D83aD479dF0C222F0492385381dD',
    3,
    0,
  ],
  ['0xae78736Cd615f374D3085123A210448E74Fc6393', 1, 0],
  ['0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', 0, 0],
  ['0xDc0b02849Bb8E0F126a216A2840275Da829709B0', 51, 0],
  ['0x4104b135DBC9609Fc1A9490E61369036497660c8', 101, 0],
  ['0x15A629f0665A3Eb97D7aE9A7ce7ABF73AeB79415', 51, 0],
  ['0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050', 0, 0],
  ['0x808D3E6b23516967ceAE4f17a5F9038383ED5311', 51, 0],
  ['0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d', 0, 0],
  ['0xf49764c9C5d644ece6aE2d18Ffd9F1E902629777', 51, 0],
  ['0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', 0, 0],
  ['0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84', 51, 0],
  ['0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF', 1, 0],
  ['0xADF15Ec41689fc5b6DcA0db7c53c9bFE7981E655', 51, 0],
  ['0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', 0, 0],
  ['0x804c23B6CCFa0a1FAE1a81C9964f42aE689c790E', 4, 0],
  ['0x65f7BA4Ec257AF7c55fd5854E5f6356bBd0fb8EC'],
  ['0x62199B909FB8B8cf870f97BEf2cE6783493c4908'],
  ['0x402F878BDd1f5C66FdAF0fabaBcF74741B68ac36', 0, 0],
  ['0x31429d1856aD1377A8A0079410B297e1a9e214c2', 0, 0],
  ['0x752B4c6e92d96467fE9b9a2522EF07228E00F87c', 0, 0],
  ['0xFE32747d0251BA92bcb80b6D16C8257eCF25AB1C', 151, 0],
  ['0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef', 9, 0],
  ['0xd6ecDfD41dDB7167F3eD9b37f33Fb24D57543E26', 0, 0],
  ['0x586Aa273F262909EEF8fA02d90Ab65F5015e0516', 1, 0],
  ['0x79317218de52Dfa2a233a3AeED098161889418c7', 3, 0],
  ['0x973F054eDBECD287209c36A2651094fA52F99a71', 2, 0],
  ['0x466a756E9A7401B5e2444a3fCB3c2C12FBEa0a54', 2, 0],
  ['0xf05e58fCeA29ab4dA01A495140B349F8410Ba904', 1, 0],
  ['0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6', 0, 0],
  ['0x2Fe269292f74F0a98C5786088317B4f86313C211', 0, 0],
  ['0xFe2e637202056d30016725477c5da089Ab0A043A', 303, 0],
  ['0xfF709449528B6fB6b88f557F7d93dEce33bca78D', 7, 0],
  ['0x559eBC30b0E58a45Cc9fF573f77EF1e5eb1b3E18', 0, 0],
  ['0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E', 0, 0],
  ['0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6', 0, 0],
  ['0x8E3Cf6478582a87A30cd5E6a10e939B642Cd7c16', 0, 0],
  ['0xBCe0Cf87F513102F22232436CCa2ca49e815C3aC', 3, 0],
  ['0xBcB8b7FC9197fEDa75C101fA69d3211b5a30dCD9', 1, 0],
  ['0x6021444f1706f15465bEe85463BCc7d7cC17Fc03', 1, 0],
  ['0x04969cD041C0cafB6AC462Bd65B536A5bDB3A670', 1, 0],
  ['0xeD35af169aF46a02eE13b9d79Eb57d6D68C1749e', 51, 0],
  ['0x45fDb1b92a649fb6A64Ef1511D3Ba5Bf60044838', 0, 0],
  ['0x52dDdA10eb0abdb34528329C4aF16d218AB95bD1', 151, 0],
  ['0x70e8dE73cE538DA2bEEd35d14187F6959a8ecA96', 7, 0],
  ['0xc5bDdf9843308380375a611c18B50Fb9341f502A', 5, 0],
  ['0x2A54bA2964C8Cd459Dc568853F79813a60761B58'],
  ['0x99899399C097a55afb6b48f797Dc5AcfA7d343B1', 0, 0],
  ['0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC', 7, 1],
  ['0xed03Ed872159e199065401b6d0D487d78d9464AA', 51, 0],
  ['0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c', 9, 0],
  ['0xEE586e7Eaad39207F0549BC65f19e336942C992f', 5, 0],
  ['0xfd56a3DCFc0690881A466AE432D71bB2dB588083', 1, 0],
  ['0x213ecAe6b3CbC0AD976f7d82626546d5b63A71cB', 103, 0],
  ['0xB620Be8a1949AA9532e6a3510132864EF9Bc3F82', 1, 0],
  ['0x0879c1a344910c2944C29b892A1CF0c216122C66', 0, 0],
  ['0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab', 0, 0],
  ['0x00000000008FD4F395Ec6F12920bae9Cb6C722e4', 0, 0],
  ['0x061aee9ab655e73719577EA1df116D7139b2A7E7', 51, 0],
  ['0x4b13006980aCB09645131b91D259eaA111eaF5Ba', 1, 0],
  ['0x8616E8EA83f048ab9A5eC513c9412Dd2993bcE3F', 1, 0],
  ['0xBFEf1f07018B3a87fc1E12877038f9616512D587', 0, 0],
  ['0xBe9895146f7AF43049ca1c1AE358B0541Ea49704', 9, 0],
  ['0x030bA81f1c18d280636F32af80b9AAd02Cf0854e', 52, 0],
  ['0x6810e776880C02933D47DB1b9fc05908e5386b96', 0, 0],
  ['0x26f01FE3BE55361b0643bc9d5D60980E37A2770D', 0, 0],
  ['0x0eC9F76202a7061eB9b3a7D6B59D36215A7e37da', 0, 0],
  ['0x825Ba129b3EA1ddc265708fcbB9dd660fdD2ef73', 0, 0],
  ['0x0000000000Da9E0e8C2a40510F991ceF596Ab682', 0, 0],
  ['0xC08512927D12348F6620a698105e1BAac6EcD911', 51, 0],
  ['0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', 0, 0],
  ['0x4c1317326fD8EFDeBdBE5e1cd052010D97723bd6', 5, 1],
  ['0x408e41876cCCDC0F92210600ef50372656052a38', 1, 0],
  ['0x3236A63c21Fc524a51001ea2627697fDcA86E897', 0, 0],
  ['0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', 0, 0],
  ['0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', 1, 0],
  ['0x111111111117dC0aa78b770fA6A738034120C302', 0, 0],
  ['0x333333335a28ae8a579b0f513f7BAF1B7881d9d3'],
  ['0xe5c987F93734cb44AB03F1B18e30A374254891b6'],
  ['0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', 0, 0],
  ['0x1Ee4dE3CD1505Ddb2e60C20651A4aB7FfABDc8F6', 0, 0],
  ['0x246BE97fda42375c39E21377Ad80D8290AfdB994', 0, 0],
  ['0xe661493a2F94ccA7f0A7C0566290F9c12e69bd52'],
  ['0x238533e6674C798fE00CB21CfD127c002b5bfcF1'],
  ['0x015B94AB2B0A14A96030573FBcD0F3D3d763541F', 2, 0],
  ['0x1b78BA1d8C437C9699Af08a8d4fB63aF2930C310'],
  ['0x72dfe359150984C8013105BbbAEe9a152335bD23', 0, 0],
  ['0xC22956c3CFeC3Ee9A9925abeE044F05Bc47f6632', 5, 0],
  ['0x5B71952A230bBE5ff6A853EB2068713727b30478', 0, 0],
  ['0x44dB359bf01F8b521A6295E4d56991277f410AA2', 4, 0],
  ['0x6967299e9F3d5312740Aa61dEe6E9ea658958e31', 4, 0],
  ['0x2F141Ce366a2462f02cEA3D12CF93E4DCa49e4Fd', 6, 0],
  ['0x28a08c8808deE574F4a23f9bE326c2d42e587Aba', 4, 0],
  ['0xBE4fe13A73675c49A17f3524602634913C668B4C', 4, 0],
  ['0x3C20Ac688410bE8F391bE1fb00AFc5C212972F86', 1, 0],
  ['0x97983236bE88107Cc8998733Ef73D8d969c52E37', 0, 0],
  ['0x3231Cb76718CDeF2155FC47b5286d82e6eDA273f'],
  ['0xC285B7E09A4584D027E5BC36571785B515898246', 4, 0],
  ['0xb8b295df2cd735b15BE5Eb419517Aa626fc43cD5'],
  ['0x36F8d0D0573ae92326827C4a82Fe4CE4C244cAb6', 51, 0],
  ['0xA5269A8e31B93Ff27B887B56720A25F844db0529', 51, 0],
  ['0xAFe7131a57E44f832cb2dE78ade38CaD644aaC2f', 51, 0],
  ['0x11EBe21e9d7BF541A18e1E3aC94939018Ce88F0b', 0, 0],
  ['0x66eFF5221ca926636224650Fd3B9c497FF828F7D', 2, 0],
  ['0x051d7e5609917Bd9b73f04BAc0DED8Dd46a74301', 7, 1],
  ['0xEe95CD26291fd1ad5d94bCeD4027e396a20d1F38', 4, 0],
  ['0x81Fd92BfC9E5226910019802C5D3D07093C878eD'],
  ['0x4b7Dc127ecEf167b31e51785F43c3840fC8f966A'],
  ['0xab5eB14c09D416F0aC63661E57EDB7AEcDb9BEfA', 3, 0],
  ['0x3f92247053508C7662C9A24ccd01229Fe0EF7419'],
  ['0x46cD37F057dC78f6Cd2a4eB89BF9F991fB81BaAb', 0, 0],
  ['0xc56c2b7e71B54d38Aab6d52E94a04Cbfa8F604fA', 51, 0],
  ['0x9F77BA354889BF6eb5c275d4AC101e9547f15AdB', 0, 0],
  ['0x530824DA86689C9C17CdC2871Ff29B058345b44a'],
  ['0x5E5d9aEeC4a6b775a175b883DCA61E4297c14Ecb', 51, 0],
  ['0x1B3C515F58857E141A966b33182f2F3feECC10E9', 0, 0],
  ['0x94A18d9FE00bab617fAD8B49b11e9F1f64Db6b36', 1, 0],
  ['0xe2f3D42443605Fc4ad5bcE82F0e9BFffBCffA6Ca', 0, 0],
  ['0x1EDF1cf760ebfb6E0b7BD410c2beBB591c7523dd', 0, 0],
  ['0x820802Fa8a99901F52e39acD21177b0BE6EE2974', 51, 0],
  ['0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'],
  ['0xc2544A32872A91F4A553b404C6950e89De901fdb', 0, 0],
  ['0xa2847348b58CEd0cA58d23c7e9106A49f1427Df6', 0, 0],
  ['0x3d1E5Cf16077F349e999d6b21A4f646e83Cd90c5', 51, 0],
  ['0x334cB66050049c1E392007B018321c44A1dbFaC4', 0, 0],
  ['0x9D1EAD8Ad4db315d5234FD05135dB2324ac602cd', 1, 0],
  ['0x535321013A1E2D5aF3B1853812a64CA3fc6C1fa1'],
  ['0x7AC168c81F4F3820Fa3F22603ce5864D6aB3C547', 0, 0],
  ['0xDF4Ef6EE483953fE3B84ABd08C6A060445c01170', 0, 0],
  ['0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8', 0, 0],
  ['0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F', 0, 0],
  ['0x36ff4DaE0E88113D68B1209e245B0e3Af92E9D58', 0, 0],
  ['0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3'],
  ['0x6bA75D640bEbfe5dA1197bb5A2aff3327789b5d3', 101, 0],
  ['0x97de57eC338AB5d51557DA3434828C5DbFaDA371', 1, 0],
  ['0x808507121B80c02388fAd14726482e061B8da827', 15, 0],
  ['0x5Ea630e00D6eE438d3deA1556A110359ACdc10A9', 0, 0],
  ['0x50400742a752ACB5DfAF702cDF09bb6a82112b03', 0, 0],
  ['0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4', 0, 0],
  ['0x6fB3e0A217407EFFf7Ca062D46c26E5d60a14d69', 0, 0],
  ['0x9F90B457Dea25eF802E38D470ddA7343691D8FE1', 0, 0],
  ['0x1Cd879bD9AA9877259262A7cdBF05206202BD416', 8, 0],
  ['0x20b3B07E9C0e37815e2892Ab09496559F57C3603', 51, 0],
  ['0x68529CEf97A6497841754439E71e104911772392', 51, 0],
  ['0xd4ffbA8910129C2C0477F90f26b118d5Aa6739A2', 51, 0],
  ['0x905F06DEBcd355809c0EAbe2aBc1332A5C7159CD', 0, 0],
  ['0x699bA988e0D34ADeDb9Ebdfb11e6ED14E2485eCc', 0, 0],
  ['0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b', 3, 0],
  ['0xA35b1B31Ce002FBF2058D22F30f95D405200A15b', 51, 0],
  ['0xFEEf77d3f69374f66429C91d732A244f074bdf74', 0, 0],
  ['0x01bF66BEcDcFD6D59A5Ca18869f494feA086cdfD'],
  ['0xa48F322F8b3edff967629Af79E027628b9Dd1298', 4, 0],
  ['0x6e2A189AdF666C06950169f11197aB0C549d5C42', 0, 0],
  ['0x70A3a0B404e24D9afbd42E03A366Ee1eCc4C5D4b', 0, 0],
  ['0xA008d9Bc5Cb748A02d98c88e1E9E2D69B7433eb0', 2, 0],
  ['0x821A278dFff762c76410264303F25bF42e195C0C', 2, 0],
  ['0xdf3ac4F479375802A821f7b7b46Cd7EB5E4262cC', 2, 0],
  ['0x776280F68aD33c4d49e6846507B7dBaf7811c89F', 1, 0],
  ['0x401E5761bd48b8326D5F1072C0b66f13ecdCBEae', 0, 0],
  ['0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', 1, 0],
  ['0x9847a74fB7C3c4362220f616E15b83A58527F7E4', 23, 1],
  ['0x1BED97CBC3c24A4fb5C069C6E311a967386131f7', 1, 1],
  ['0xb2F30A7C980f052f02563fb518dcc39e6bf38175'],
  ['0x571f54D23cDf2211C83E9A0CbD92AcA36c48Fa02', 0, 0],
  ['0x183015a9bA6fF60230fdEaDc3F43b3D788b13e21', 1, 0],
  ['0xed4d84225273c867d269F967CC696e0877068f8a', 0, 0],
  ['0x365AccFCa291e7D3914637ABf1F7635dB165Bb09', 6, 1],
  ['0x183395DbD0B5e93323a7286D1973150697FFFCB3', 0, 0],
  ['0xe19d1c837B8A1C83A56cD9165b2c0256D39653aD', 0, 0],
  ['0xa10A5e2d813a51374592D6ce440B149F01CF9A7D', 3, 0],
  ['0xB098E7F74D66E5D654aaA19F3B4B071D7f442CB3', 1, 0],
  ['0x8191DC3053Fe4564c17694cB203663d3C07B8960', 2, 0],
  ['0xCFC5bD99915aAa815401C5a41A927aB7a38d29cf', 3, 0],
  ['0xdA47862a83dac0c112BA89c6abC2159b95afd71C', 7, 0],
  ['0xfd37356c1a62288b32Fa58188c77Ab0D694a0f4E', 0, 1],
  ['0x34635280737b5BFe6c7DC2FC3065D60d66e78185', 0, 0],
  ['0xe3668873D944E4A949DA05fc8bDE419eFF543882', 0, 1],
  ['0x68592c5c98C4F4A8a4bC6dA2121E65Da3d1c0917', 9, 0],
  ['0x2C2D8a078B33bf7782a16AcCE2C5BA6653a90D5f', 2, 0],
  ['0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6', 3, 0],
  ['0xe9633C52f4c8B7BDeb08c4A7fE8a5c1B84AFCf67', 0, 0],
  ['0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44', 0, 0],
  ['0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C'],
  ['0x03CB4438d015B9646d666316b617a694410C216d', 3, 0],
  ['0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32', 3, 0],
  ['0x815b4cE34faC32b951bD26ea85901e3b834204B6', 6, 0],
  ['0x0E573Ce2736Dd9637A0b21058352e1667925C7a8'],
]

const allowanceSlotInfo: RawSlotInfo[] = [
  ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 10, 0],
]

export enum MappingStyle {
  Solidity = 0,
  Vyper = 1,
}

export interface SlotInfo {
  contract: Address
  slot: number
  mappingStyle: MappingStyle
}

function slotInfoFromRaw(slot: RawSlotInfo): SlotInfo | undefined {
  if (slot.length === 1) return
  if (slot.length === 3)
    return {
      contract: slot[0],
      slot: slot[1],
      mappingStyle: slot[2],
    }
  else if (slot.length === 4)
    return {
      contract: slot[1],
      slot: slot[2],
      mappingStyle: slot[3],
    }
  return
}

const balanceSlotMap = new Map<Address, SlotInfo>()
balanceSlotInfo.forEach((b) => {
  const slot = slotInfoFromRaw(b)
  if (slot) balanceSlotMap.set(b[0], slot)
})

const allowanceSlotMap = new Map<Address, SlotInfo>()
allowanceSlotInfo.forEach((b) => {
  const slot = slotInfoFromRaw(b)
  if (slot) allowanceSlotMap.set(b[0], slot)
})

function getMapSlotNumber(
  user: Address,
  mapSlot: number | Hex,
  mappingStyle: MappingStyle,
) {
  const userPadded = user.substring(2).padStart(64, '0')
  const slotPadded =
    typeof mapSlot === 'number'
      ? Number(mapSlot).toString(16).padStart(64, '0')
      : mapSlot.substring(2).padStart(64, '0')
  const slotData: Hex =
    mappingStyle === MappingStyle.Solidity
      ? `0x${userPadded}${slotPadded}`
      : `0x${slotPadded}${userPadded}`
  return keccak256(slotData)
}

export function tokenBalanceSlot(
  token: Address,
  user: Address,
): Hex | undefined {
  const slotInfo = balanceSlotMap.get(token)
  if (slotInfo === undefined) return undefined
  return getMapSlotNumber(user, slotInfo.slot, slotInfo.mappingStyle)
}

export function tokenAllowedSlot(
  token: Address,
  user: Address,
  spender: Address,
): Hex | undefined {
  const slotInfo = allowanceSlotMap.get(token)
  if (slotInfo === undefined) return undefined
  const tmp = getMapSlotNumber(user, slotInfo.slot, slotInfo.mappingStyle)
  return getMapSlotNumber(spender, tmp, slotInfo.mappingStyle)
}
