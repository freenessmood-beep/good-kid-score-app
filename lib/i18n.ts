export type Lang = 'en' | 'zh'

const translations = {
  en: {
    // App
    appName: 'Good Kid Score App',
    appSubtitle: 'Earn Carrots, Grow Happy! 🥕',

    // Navbar
    navHome: 'Home',
    navRewards: 'Rewards',
    navTrades: 'Trades',
    navLeaderboard: 'Ranking',

    // Auth
    login: 'Login',
    signUp: 'Sign Up',
    welcomeBack: '👋 Welcome Back!',
    createAccount: '✨ Create Account',
    yourName: 'Your Name',
    namePlaceholder: 'e.g. Parent Mom',
    email: 'Email',
    password: 'Password',
    invitationCode: 'Invitation Code',
    invitationCodeHint: 'optional — join as viewer',
    invitationCodeNote: 'Leave blank to sign up as an owner (parent).',
    inviteCodePlaceholder: 'e.g. ABC123',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    loading: '⏳ Loading...',
    carrotMotivation: '🥕 Earn carrots for good behavior! 🥕',

    // Dashboard
    monthSummary: '🗓️',
    inviteViewer: 'Invite Viewer',
    addBunny: 'Add Bunny',
    exportAllPdf: 'Export All PDF',
    invitePanelTitle: '🔗 Invite a Viewer (Child)',
    invitePanelDesc: 'Generate a one-time code and share it. They sign up using this code and join as a',
    invitePanelViewer: 'viewer',
    generating: '⏳ Generating...',
    generateInviteCode: '✨ Generate Invite Code',
    copy: 'Copy',
    copied: 'Copied!',
    newCode: 'New Code',
    inviteCodeHintText: 'Share this code with your child. They enter it on the Sign Up page. The code can only be used once.',
    noBunniesYet: 'No bunnies yet!',
    noBunniesHint: 'Click "Add Bunny" to get started.',

    // BunnyCard
    earnedThisMonth: 'earned this month',
    availableTotal: 'available (total)',

    // Child Detail
    backToDashboard: 'Back to Dashboard',
    carrots: 'carrots',
    carrots_this_month: 'carrots this month',
    addScore: 'Add Score',
    exportPdf: 'Export PDF',
    rewardsEarnedTitle: '🎉 Rewards Earned This Month!',
    scoreHistory: 'Score History',
    noEntriesThisMonth: 'No entries for this month yet!',
    noEntriesHint: 'Click "Add Score" to add one.',

    // Add Score Modal
    addScoreFor: 'Add Score for',
    date: 'Date',
    carrotsLabel: 'Carrots 🥕',
    noteOptional: 'Note (optional)',
    notePlaceholder: 'What did they do great today? 🌟',
    cancel: 'Cancel',
    save: '🥕 Save',

    // Add Child Modal
    addNewBunny: '🐰 Add New Bunny',
    childName: "Bunny's Name",
    childNamePlaceholder: 'e.g. Lily',
    bunnyColor: 'Bunny Color',
    addBunnyBtn: '🐰 Add Bunny',

    // Rewards Page
    rewardsTitle: 'Rewards Table',
    rewardsSubtitle: 'Earn carrots 🥕 to unlock rewards!',
    rewardsMotivation: '🌟 Keep earning carrots and reach new rewards every month!',
    addReward: 'Add Reward',
    noRewardsYet: 'No rewards set yet.',
    noRewardsOwner: 'Add some rewards to motivate!',
    noRewardsViewer: 'Ask a parent to add rewards!',

    // Trades Page
    tradesTitle: 'Trading Area',
    tradesSubtitle: 'Redeem your 🥕 carrots for rewards!',
    tradingRecords: 'Trading Records',
    newTrade: 'New Trade',
    noTradesYet: 'No trades yet!',
    noTradesHint: 'Click "New Trade" to redeem carrots for a reward.',
    earned: 'Earned',
    spent: 'Spent',
    available: 'Available',
    newTradeTitle: '🛒 New Trade',
    selectChild: 'Select a bunny...',
    reward: 'Reward',
    customReward: 'Custom reward...',
    customRewardPlaceholder: 'Enter custom reward name',
    carrotsToSpend: 'Carrots to Spend 🥕',
    note: 'Note',
    noteTradePlaceholder: 'e.g. Traded on Friday night',
    confirmTrade: '🛒 Confirm Trade',

    // Transfers
    transfersTab: 'Transfers',
    tradesTab: 'Trades',
    newTransfer: 'New Transfer',
    fromBunny: 'From Bunny',
    toBunny: 'To Bunny',
    transferAmount: 'Carrots to Transfer 🥕',
    confirmTransfer: '🐰 Confirm Transfer',
    noTransfersYet: 'No transfers yet!',
    noTransfersHint: 'Click "New Transfer" to send carrots to another bunny.',
    transferredTo: 'Transferred to',
    transferredFrom: 'Received from',

    // Leaderboard
    leaderboardTitle: 'Bunny Carrot Ranking',
    leaderboardSubtitle: 'Who earned the most carrots? 🥕',
    rank: 'Rank',
    totalEarned: 'Total Earned',

    // Delete Bunny
    deleteBunny: 'Delete Bunny',
    deleteBunnyConfirm: 'Are you sure you want to delete this bunny? All scores and trades will be permanently deleted.',
    deleting: 'Deleting...',

    // Link viewer
    linkViewer: 'Link to Viewer Account',
    linkViewerHint: 'Optional — lets the child log in and manage their own bunny',
    noViewers: 'No viewer accounts yet',
    linkedTo: 'Linked to',

    // Passcode
    setPasscode: 'Set Passcode',
    changePasscode: 'Change Passcode',
    passcodeLabel: '4-Digit Passcode',
    confirmPasscodeLabel: 'Confirm Passcode',
    passcodeHint: 'Required to add carrots',
    enterPasscode: 'Enter Passcode',
    enterPasscodeHint: 'Enter your 4-digit passcode to confirm',
    wrongPasscode: 'Wrong passcode. Try again.',
    passcodeMismatch: 'Passcodes do not match.',
    passcodeInvalid: 'Passcode must be exactly 4 digits.',
    passcodeSet: '🔐 Passcode saved!',
    noPasscodeWarning: '⚠️ No passcode set — set one to protect adding carrots.',

    // Earning Rules
    earningRulesTitle: 'How to Earn Carrots',
    earningRulesSubtitle: 'Complete these activities to earn 🥕!',
    addEarningRule: 'Add Rule',
    noEarningRulesYet: 'No earning rules yet.',
    noEarningRulesOwner: 'Add rules to guide your bunnies!',
    noEarningRulesViewer: 'Ask a parent to add earning rules!',

    // Rewards Menu (on trades page)
    rewardsMenu: 'Rewards Menu',
    rewardsMenuSubtitle: 'What can you get with your carrots?',

    // Export
    monthlyReport: 'Monthly Report',
    monthlySummary: 'Monthly Summary',
    scoreEntries: 'Score Entries',
    tradesRedemptions: 'Trades / Redemptions',
    rewardsReached: '🎉 Rewards Reached',
    noActivityThisMonth: 'No activity this month',
    generatedBy: 'Generated by Good Kid Score App',
    carrots_earned: 'carrots earned',
  },
  zh: {
    // App
    appName: '乖寶寶記分 App',
    appSubtitle: '賺取紅蘿蔔，快樂成長！🥕',

    // Navbar
    navHome: '首頁',
    navRewards: '獎勵',
    navTrades: '兌換',
    navLeaderboard: '排行榜',

    // Auth
    login: '登入',
    signUp: '註冊',
    welcomeBack: '👋 歡迎回來！',
    createAccount: '✨ 建立帳號',
    yourName: '你的名字',
    namePlaceholder: '例如：爸爸',
    email: '電子郵件',
    password: '密碼',
    invitationCode: '邀請碼',
    invitationCodeHint: '選填 — 以觀看者身份加入',
    invitationCodeNote: '不填邀請碼則以家長（管理者）身份註冊。',
    inviteCodePlaceholder: '例如：ABC123',
    alreadyHaveAccount: '已有帳號？',
    dontHaveAccount: '還沒有帳號？',
    loading: '⏳ 載入中...',
    carrotMotivation: '🥕 做個乖寶寶，賺取紅蘿蔔！🥕',

    // Dashboard
    monthSummary: '🗓️',
    inviteViewer: '邀請觀看者',
    addBunny: '新增兔兔',
    exportAllPdf: '匯出全部 PDF',
    invitePanelTitle: '🔗 邀請觀看者（孩子）',
    invitePanelDesc: '產生一次性邀請碼並分享。對方使用此碼註冊後將成為',
    invitePanelViewer: '觀看者',
    generating: '⏳ 產生中...',
    generateInviteCode: '✨ 產生邀請碼',
    copy: '複製',
    copied: '已複製！',
    newCode: '新邀請碼',
    inviteCodeHintText: '將此碼分享給孩子，讓他們在註冊頁面輸入。每個邀請碼只能使用一次。',
    noBunniesYet: '還沒有兔兔！',
    noBunniesHint: '點擊「新增兔兔」開始吧。',

    // BunnyCard
    earnedThisMonth: '本月賺取',
    availableTotal: '目前擁有（總計）',

    // Child Detail
    backToDashboard: '返回首頁',
    carrots: '紅蘿蔔',
    carrots_this_month: '本月紅蘿蔔',
    addScore: '新增分數',
    exportPdf: '匯出 PDF',
    rewardsEarnedTitle: '🎉 本月已達成獎勵！',
    scoreHistory: '得分紀錄',
    noEntriesThisMonth: '本月尚無紀錄！',
    noEntriesHint: '點擊「新增分數」來新增。',

    // Add Score Modal
    addScoreFor: '為',
    date: '日期',
    carrotsLabel: '紅蘿蔔 🥕',
    noteOptional: '備註（選填）',
    notePlaceholder: '今天做了什麼棒棒的事？🌟',
    cancel: '取消',
    save: '🥕 儲存',

    // Add Child Modal
    addNewBunny: '🐰 新增兔兔',
    childName: '兔兔的名字',
    childNamePlaceholder: '例如：小明',
    bunnyColor: '兔兔顏色',
    addBunnyBtn: '🐰 新增兔兔',

    // Rewards Page
    rewardsTitle: '獎勵清單',
    rewardsSubtitle: '賺取紅蘿蔔 🥕 來解鎖獎勵！',
    rewardsMotivation: '🌟 持續賺取紅蘿蔔，每個月達成新獎勵！',
    addReward: '新增獎勵',
    noRewardsYet: '尚未設定任何獎勵。',
    noRewardsOwner: '新增獎勵來激勵孩子！',
    noRewardsViewer: '請家長新增獎勵！',

    // Trades Page
    tradesTitle: '兌換區',
    tradesSubtitle: '用紅蘿蔔 🥕 兌換獎勵！',
    tradingRecords: '兌換紀錄',
    newTrade: '新增兌換',
    noTradesYet: '尚無兌換紀錄！',
    noTradesHint: '點擊「新增兌換」來兌換獎勵。',
    earned: '已賺取',
    spent: '已兌換',
    available: '目前擁有',
    newTradeTitle: '🛒 新增兌換',
    selectChild: '選擇兔兔...',
    reward: '獎勵',
    customReward: '自訂獎勵...',
    customRewardPlaceholder: '輸入自訂獎勵名稱',
    carrotsToSpend: '要花費的紅蘿蔔 🥕',
    note: '備註',
    noteTradePlaceholder: '例如：週五晚上兌換',
    confirmTrade: '🛒 確認兌換',

    // Transfers
    transfersTab: '轉帳',
    tradesTab: '兌換',
    newTransfer: '新增轉帳',
    fromBunny: '從哪隻兔兔',
    toBunny: '給哪隻兔兔',
    transferAmount: '要轉移的紅蘿蔔 🥕',
    confirmTransfer: '🐰 確認轉帳',
    noTransfersYet: '尚無轉帳紀錄！',
    noTransfersHint: '點擊「新增轉帳」來傳送紅蘿蔔給其他兔兔。',
    transferredTo: '轉給',
    transferredFrom: '收到來自',

    // Leaderboard
    leaderboardTitle: '兔兔紅蘿蔔排行榜',
    leaderboardSubtitle: '誰賺到最多紅蘿蔔？🥕',
    rank: '名次',
    totalEarned: '總計賺取',

    // Delete Bunny
    deleteBunny: '刪除兔兔',
    deleteBunnyConfirm: '確定要刪除這隻兔兔嗎？所有分數及兌換紀錄將永久刪除。',
    deleting: '刪除中...',

    // Link viewer
    linkViewer: '連結觀看者帳號',
    linkViewerHint: '選填 — 讓孩子登入並管理自己的兔兔',
    noViewers: '目前沒有觀看者帳號',
    linkedTo: '連結至',

    // Passcode
    setPasscode: '設定密碼',
    changePasscode: '更改密碼',
    passcodeLabel: '4位數密碼',
    confirmPasscodeLabel: '確認密碼',
    passcodeHint: '新增紅蘿蔔時需要',
    enterPasscode: '輸入密碼',
    enterPasscodeHint: '輸入4位數密碼以確認',
    wrongPasscode: '密碼錯誤，請重試。',
    passcodeMismatch: '兩次密碼不符。',
    passcodeInvalid: '密碼必須為4位數字。',
    passcodeSet: '🔐 密碼已儲存！',
    noPasscodeWarning: '⚠️ 尚未設定密碼 — 請設定以保護新增紅蘿蔔功能。',

    // Earning Rules
    earningRulesTitle: '如何賺取紅蘿蔔',
    earningRulesSubtitle: '完成這些活動來賺取 🥕！',
    addEarningRule: '新增規則',
    noEarningRulesYet: '尚未設定任何規則。',
    noEarningRulesOwner: '新增規則來引導你的兔兔！',
    noEarningRulesViewer: '請家長新增賺取規則！',

    // Rewards Menu (on trades page)
    rewardsMenu: '獎勵清單',
    rewardsMenuSubtitle: '你可以用紅蘿蔔換什麼？',

    // Export
    monthlyReport: '月份報告',
    monthlySummary: '月份總覽',
    scoreEntries: '得分紀錄',
    tradesRedemptions: '兌換紀錄',
    rewardsReached: '🎉 已達成獎勵',
    noActivityThisMonth: '本月無活動',
    generatedBy: '由乖寶寶記分 App 產生',
    carrots_earned: '紅蘿蔔',
  }
}

export type TranslationKey = keyof typeof translations.en

export function getT(lang: Lang) {
  return (key: TranslationKey): string => translations[lang][key] ?? translations.en[key]
}
