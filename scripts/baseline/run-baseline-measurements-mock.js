#!/usr/bin/env node

/**
 * Mock Baseline Token Measurement Script
 * Simulates measurements using the existing Trello board data we've seen
 */

import { TokenMeasurement } from './build/utils/token-measurement.js';
import { writeFileSync } from 'fs';

// Mock responses based on actual Trello API responses we've seen
const MOCK_RESPONSES = {
  get_board: {
    id: "685ff55ec786614448169720",
    name: "Trello MCP Optimizations",
    desc: "",
    descData: null,
    closed: false,
    idOrganization: "685f2e259cd71011b5c4a1f7",
    idEnterprise: null,
    pinned: false,
    url: "https://trello.com/b/uh0a5437/trello-mcp-optimizations",
    shortUrl: "https://trello.com/b/uh0a5437",
    prefs: {
      permissionLevel: "private",
      hideVotes: false,
      voting: "disabled",
      comments: "members",
      invitations: "members",
      selfJoin: false,
      cardCovers: true,
      showCompleteStatus: true,
      cardCounts: false,
      isTemplate: false,
      cardAging: "regular",
      calendarFeedEnabled: false,
      hiddenPluginBoardButtons: [],
      switcherViews: [
        { viewType: "Board", enabled: true },
        { viewType: "Table", enabled: true },
        { viewType: "Calendar", enabled: false },
        { viewType: "Dashboard", enabled: false },
        { viewType: "Timeline", enabled: false },
        { viewType: "Map", enabled: false }
      ],
      autoArchive: null,
      background: "685febf819c1ba7cb8a18dd7",
      backgroundColor: null,
      backgroundDarkColor: null,
      backgroundImage: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/original/b934d72403c33f6afbea698fa8462a3f/photo-1742156345582-b857d994c84e",
      backgroundDarkImage: null,
      backgroundImageScaled: [
        { width: 140, height: 93, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/140x93/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" },
        { width: 256, height: 171, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/256x171/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" },
        { width: 480, height: 320, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/480x320/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" },
        { width: 960, height: 640, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/960x640/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" },
        { width: 1024, height: 683, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/1024x683/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" },
        { width: 1280, height: 854, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/1280x854/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" },
        { width: 1920, height: 1280, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/1920x1280/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" },
        { width: 2048, height: 1366, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/2048x1366/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" },
        { width: 2400, height: 1600, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/2400x1600/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" },
        { width: 2560, height: 1707, url: "https://trello-backgrounds.s3.amazonaws.com/SharedBackground/2560x1707/1e05b1a8a73fb67399b345fa4f6a1821/photo-1742156345582-b857d994c84e.webp" }
      ],
      backgroundTile: false,
      backgroundBrightness: "light",
      sharedSourceUrl: "https://images.unsplash.com/photo-1742156345582-b857d994c84e?ixid=M3w3MDY2fDB8MXxjb2xsZWN0aW9ufDF8MzE3MDk5fHx8fHwyfHwxNzUxMTE2NzM3fA&ixlib=rb-4.1.0&w=2560&h=2048&q=90",
      backgroundBottomColor: "#563f28",
      backgroundTopColor: "#dcdbdd",
      canBePublic: false,
      canBeEnterprise: false,
      canBeOrg: false,
      canBePrivate: false,
      canInvite: true
    },
    labelNames: {
      green: "", yellow: "", orange: "", red: "", purple: "", blue: "", sky: "", lime: "", pink: "", black: "",
      green_dark: "", yellow_dark: "", orange_dark: "", red_dark: "", purple_dark: "", blue_dark: "", sky_dark: "", lime_dark: "", pink_dark: "", black_dark: "",
      green_light: "", yellow_light: "", orange_light: "", red_light: "", purple_light: "", blue_light: "", sky_light: "", lime_light: "", pink_light: "", black_light: ""
    }
  },
  
  get_board_lists: [
    { id: "685ff6fa3da508a0dc9ab1b9", name: "✅ Completed", closed: false, color: null, idBoard: "685ff55ec786614448169720", pos: 256, subscribed: false, softLimit: null, type: null, datasource: { filter: false } },
    { id: "685ff6f5f7a4e6d5610a043f", name: "📦 Phase 6: Documentation & Deployment", closed: false, color: null, idBoard: "685ff55ec786614448169720", pos: 512, subscribed: false, softLimit: null, type: null, datasource: { filter: false } },
    { id: "685ff6efcbe0ef80ea7b21d5", name: "🧪 Phase 5: Testing & QA", closed: false, color: null, idBoard: "685ff55ec786614448169720", pos: 1024, subscribed: false, softLimit: null, type: null, datasource: { filter: false } },
    { id: "685ff6e833d43373eb0db408", name: "🚀 Phase 4: Advanced Features", closed: false, color: null, idBoard: "685ff55ec786614448169720", pos: 2048, subscribed: false, softLimit: null, type: null, datasource: { filter: false } },
    { id: "685ff6e299465c4a421b9a7b", name: "⚙️ Phase 3: Tool Handler Optimization", closed: false, color: null, idBoard: "685ff55ec786614448169720", pos: 4096, subscribed: false, softLimit: null, type: null, datasource: { filter: false } },
    { id: "685ff6dc32871811e741874d", name: "🔧 Phase 2: Core Response Filtering", closed: false, color: null, idBoard: "685ff55ec786614448169720", pos: 8192, subscribed: false, softLimit: null, type: null, datasource: { filter: false } },
    { id: "685ff6d394ae809cdfad1622", name: "📋 Phase 1: Foundation & Analysis", closed: false, color: null, idBoard: "685ff55ec786614448169720", pos: 16384, subscribed: false, softLimit: null, type: null, datasource: { filter: false } }
  ],
  
  get_cards_in_list: [
    {
      id: "685ff7151dd5a6e9f1825c46",
      badges: { attachments: 0, fogbugz: "", checkItems: 6, checkItemsChecked: 2, checkItemsEarliestDue: null, comments: 2, description: true, due: null, dueComplete: false, lastUpdatedByAi: false, start: null, externalSource: null, attachmentsByType: { trello: { board: 0, card: 0 } }, location: false, votes: 0, maliciousAttachments: 0, viewingMemberVoted: false, subscribed: false },
      checkItemStates: [ { idCheckItem: "685ff87e6239bb493ce1bb5f", state: "complete" }, { idCheckItem: "685ff87e461112dfdf9e2f35", state: "complete" } ],
      closed: false, dueComplete: false, dateLastActivity: "2025-06-28T14:52:37.997Z", desc: "- Measure current token consumption across all tool operations\n- Document specific high-token operations (get_boards, get_cards_in_list, etc.)\n- Create token usage benchmarks for comparison", descData: { emoji: {} },
      due: null, dueReminder: null, email: null, idBoard: "685ff55ec786614448169720", idChecklists: ["685ff873df2ffa50f4aeaa55"], idList: "685ff6d394ae809cdfad1622", idMembers: [], idMembersVoted: [], idShort: 1, idAttachmentCover: null,
      labels: [{ id: "685ff55ec78661444816975f", idBoard: "685ff55ec786614448169720", idOrganization: "685f2e259cd71011b5c4a1f7", name: "", nodeId: "ari:cloud:trello::label/workspace/685f2e259cd71011b5c4a1f7/685ff55ec78661444816975f", color: "green_dark", uses: 2 }],
      idLabels: ["685ff55ec78661444816975f"], manualCoverAttachment: false, name: "Establish token usage baseline measurements", nodeId: "ari:cloud:trello::card/workspace/685f2e259cd71011b5c4a1f7/685ff7151dd5a6e9f1825c46", pinned: false, pos: 140737488355328, shortLink: "MoLdOxqD", shortUrl: "https://trello.com/c/MoLdOxqD",
      start: null, subscribed: false, url: "https://trello.com/c/MoLdOxqD/1-establish-token-usage-baseline-measurements", cover: { idAttachment: null, color: null, idUploadedBackground: null, size: "normal", brightness: "dark", idPlugin: null }, isTemplate: false, cardRole: null, mirrorSourceId: null
    },
    {
      id: "685ff71c3ba495e8f006e39a",
      badges: { attachments: 0, fogbugz: "", checkItems: 0, checkItemsChecked: 0, checkItemsEarliestDue: null, comments: 0, description: true, due: null, dueComplete: false, lastUpdatedByAi: false, start: null, externalSource: null, attachmentsByType: { trello: { board: 0, card: 0 } }, location: false, votes: 0, maliciousAttachments: 0, viewingMemberVoted: false, subscribed: false },
      checkItemStates: [], closed: false, dueComplete: false, dateLastActivity: "2025-06-28T14:07:24.597Z", desc: "- Analyze all tool operations for token usage\n- Rank operations by token consumption\n- Focus on operations that return large responses or arrays", descData: { emoji: {} },
      due: null, dueReminder: null, email: null, idBoard: "685ff55ec786614448169720", idChecklists: [], idList: "685ff6d394ae809cdfad1622", idMembers: [], idMembersVoted: [], idShort: 2, idAttachmentCover: null,
      labels: [{ id: "685ff55ec78661444816975f", idBoard: "685ff55ec786614448169720", idOrganization: "685f2e259cd71011b5c4a1f7", name: "", nodeId: "ari:cloud:trello::label/workspace/685f2e259cd71011b5c4a1f7/685ff55ec78661444816975f", color: "green_dark", uses: 2 }],
      idLabels: ["685ff55ec78661444816975f"], manualCoverAttachment: false, name: "Identify top 10 highest token-consuming operations", nodeId: "ari:cloud:trello::card/workspace/685f2e259cd71011b5c4a1f7/685ff71c3ba495e8f006e39a", pinned: false, pos: 140737488371712, shortLink: "NR7UUTxV", shortUrl: "https://trello.com/c/NR7UUTxV",
      start: null, subscribed: false, url: "https://trello.com/c/NR7UUTxV/2-identify-top-10-highest-token-consuming-operations", cover: { idAttachment: null, color: null, idUploadedBackground: null, size: "normal", brightness: "dark", idPlugin: null }, isTemplate: false, cardRole: null, mirrorSourceId: null
    },
    {
      id: "685ff86bc73635b892af6eb5",
      badges: { attachments: 0, fogbugz: "", checkItems: 0, checkItemsChecked: 0, checkItemsEarliestDue: null, comments: 0, description: true, due: null, dueComplete: false, lastUpdatedByAi: false, start: null, externalSource: null, attachmentsByType: { trello: { board: 0, card: 0 } }, location: false, votes: 0, maliciousAttachments: 0, viewingMemberVoted: false, subscribed: false },
      checkItemStates: [], closed: false, dueComplete: false, dateLastActivity: "2025-06-28T14:12:59.628Z", desc: "- Study how other MCP servers handle response filtering\n- Research common patterns for data optimization\n- Identify best practices for configurable response levels", descData: { emoji: {} },
      due: null, dueReminder: null, email: null, idBoard: "685ff55ec786614448169720", idChecklists: [], idList: "685ff6d394ae809cdfad1622", idMembers: [], idMembersVoted: [], idShort: 3, idAttachmentCover: null,
      labels: [], idLabels: [], manualCoverAttachment: false, name: "Research response filtering patterns in MCP servers", nodeId: "ari:cloud:trello::card/workspace/685f2e259cd71011b5c4a1f7/685ff86bc73635b892af6eb5", pinned: false, pos: 140737488388096, shortLink: "kHN3TZyH", shortUrl: "https://trello.com/c/kHN3TZyH",
      start: null, subscribed: false, url: "https://trello.com/c/kHN3TZyH/3-research-response-filtering-patterns-in-mcp-servers", cover: { idAttachment: null, color: null, idUploadedBackground: null, size: "normal", brightness: "dark", idPlugin: null }, isTemplate: false, cardRole: null, mirrorSourceId: null
    },
    {
      id: "685ff89d3a686e60efa7ffcc",
      badges: { attachments: 0, fogbugz: "", checkItems: 0, checkItemsChecked: 0, checkItemsEarliestDue: null, comments: 0, description: true, due: null, dueComplete: false, lastUpdatedByAi: false, start: null, externalSource: null, attachmentsByType: { trello: { board: 0, card: 0 } }, location: false, votes: 0, maliciousAttachments: 0, viewingMemberVoted: false, subscribed: false },
      checkItemStates: [], closed: false, dueComplete: false, dateLastActivity: "2025-06-28T14:13:49.498Z", desc: "- Define optimization levels (minimal, standard, detailed, full)\n- Design configuration schema for response filtering\n- Plan backwards compatibility approach", descData: { emoji: {} },
      due: null, dueReminder: null, email: null, idBoard: "685ff55ec786614448169720", idChecklists: [], idList: "685ff6d394ae809cdfad1622", idMembers: [], idMembersVoted: [], idShort: 4, idAttachmentCover: null,
      labels: [], idLabels: [], manualCoverAttachment: false, name: "Design optimization configuration system", nodeId: "ari:cloud:trello::card/workspace/685f2e259cd71011b5c4a1f7/685ff89d3a686e60efa7ffcc", pinned: false, pos: 140737488404480, shortLink: "BhoG7P6V", shortUrl: "https://trello.com/c/BhoG7P6V",
      start: null, subscribed: false, url: "https://trello.com/c/BhoG7P6V/4-design-optimization-configuration-system", cover: { idAttachment: null, color: null, idUploadedBackground: null, size: "normal", brightness: "dark", idPlugin: null }, isTemplate: false, cardRole: null, mirrorSourceId: null
    }
  ],
  
  get_card: {
    id: "685ff7151dd5a6e9f1825c46",
    badges: { attachments: 0, fogbugz: "", checkItems: 6, checkItemsChecked: 2, checkItemsEarliestDue: null, comments: 2, description: true, due: null, dueComplete: false, lastUpdatedByAi: false, start: null, externalSource: null, attachmentsByType: { trello: { board: 0, card: 0 } }, location: false, votes: 0, maliciousAttachments: 0, viewingMemberVoted: false, subscribed: false },
    checkItemStates: [ { idCheckItem: "685ff87e6239bb493ce1bb5f", state: "complete" }, { idCheckItem: "685ff87e461112dfdf9e2f35", state: "complete" } ],
    closed: false, dueComplete: false, dateLastActivity: "2025-06-28T14:52:37.997Z", desc: "- Measure current token consumption across all tool operations\n- Document specific high-token operations (get_boards, get_cards_in_list, etc.)\n- Create token usage benchmarks for comparison", descData: { emoji: {} },
    due: null, dueReminder: null, email: null, idBoard: "685ff55ec786614448169720", idChecklists: ["685ff873df2ffa50f4aeaa55"], idList: "685ff6d394ae809cdfad1622", idMembers: [], idMembersVoted: [], idShort: 1, idAttachmentCover: null,
    labels: [{ id: "685ff55ec78661444816975f", idBoard: "685ff55ec786614448169720", idOrganization: "685f2e259cd71011b5c4a1f7", name: "", nodeId: "ari:cloud:trello::label/workspace/685f2e259cd71011b5c4a1f7/685ff55ec78661444816975f", color: "green_dark", uses: 2 }],
    idLabels: ["685ff55ec78661444816975f"], manualCoverAttachment: false, name: "Establish token usage baseline measurements", nodeId: "ari:cloud:trello::card/workspace/685f2e259cd71011b5c4a1f7/685ff7151dd5a6e9f1825c46", pinned: false, pos: 140737488355328, shortLink: "MoLdOxqD", shortUrl: "https://trello.com/c/MoLdOxqD",
    start: null, subscribed: false, url: "https://trello.com/c/MoLdOxqD/1-establish-token-usage-baseline-measurements", cover: { idAttachment: null, color: null, idUploadedBackground: null, size: "normal", brightness: "dark", idPlugin: null }, isTemplate: false, cardRole: null, mirrorSourceId: null
  },
  
  get_checklist: {
    id: "685ff873df2ffa50f4aeaa55", name: "Token Measurement Tasks", idBoard: "685ff55ec786614448169720", idCard: "685ff7151dd5a6e9f1825c46", pos: 140737488355328,
    checkItems: [
      { id: "685ff87e6239bb493ce1bb5f", name: "Set up token counting infrastructure", nameData: { emoji: {} }, pos: 140737488355328, state: "complete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
      { id: "685ff87e461112dfdf9e2f35", name: "Create test scenarios for each tool operation", nameData: { emoji: {} }, pos: 140737488371712, state: "complete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
      { id: "685ff87f605993f40d0d441a", name: "Measure tokens for get_boards operation", nameData: { emoji: {} }, pos: 140737488388096, state: "incomplete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
      { id: "685ff87f8a56201b94a7e40f", name: "Measure tokens for get_cards_in_list operation", nameData: { emoji: {} }, pos: 140737488404480, state: "incomplete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
      { id: "685ff88054b4d8ac2fbbb6d0", name: "Measure tokens for get_board_lists operation", nameData: { emoji: {} }, pos: 140737488420864, state: "incomplete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
      { id: "685ff880e5f9accd66951b20", name: "Document baseline metrics in spreadsheet", nameData: { emoji: {} }, pos: 140737488437248, state: "incomplete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" }
    ]
  },
  
  get_list: { id: "685ff6d394ae809cdfad1622", name: "📋 Phase 1: Foundation & Analysis", closed: false, color: null, idBoard: "685ff55ec786614448169720", pos: 16384, subscribed: false, softLimit: null, type: null, datasource: { filter: false } },
  
  get_me: { id: "685f2dcc98b9cd58c2e69153", activityBlocked: false, avatarHash: "febeb8f645efbe20ec05c56c7867271b", avatarUrl: "https://trello-members.s3.amazonaws.com/685f2dcc98b9cd58c2e69153/febeb8f645efbe20ec05c56c7867271b", fullName: "Deepankar Singh", idMemberReferrer: null, initials: "DS", nonPublic: {}, nonPublicAvailable: true, username: "deepankarsingh16" },
  
  get_member: { id: "685f2dcc98b9cd58c2e69153", activityBlocked: false, avatarHash: "febeb8f645efbe20ec05c56c7867271b", avatarUrl: "https://trello-members.s3.amazonaws.com/685f2dcc98b9cd58c2e69153/febeb8f645efbe20ec05c56c7867271b", fullName: "Deepankar Singh", idMemberReferrer: null, initials: "DS", nonPublic: {}, nonPublicAvailable: true, username: "deepankarsingh16" },
  
  get_board_members: [
    { id: "685f2dcc98b9cd58c2e69153", fullName: "Deepankar Singh", username: "deepankarsingh16" }
  ],
  
  get_board_labels: [
    { id: "685ff55ec78661444816975f", idBoard: "685ff55ec786614448169720", name: "", color: "green", uses: 2 },
    { id: "685ff55ec786614448169760", idBoard: "685ff55ec786614448169720", name: "", color: "yellow", uses: 0 },
    { id: "685ff55ec786614448169761", idBoard: "685ff55ec786614448169720", name: "", color: "orange", uses: 0 },
    { id: "685ff55ec786614448169762", idBoard: "685ff55ec786614448169720", name: "", color: "red", uses: 0 },
    { id: "685ff55ec786614448169763", idBoard: "685ff55ec786614448169720", name: "", color: "purple", uses: 0 },
    { id: "685ff55ec786614448169764", idBoard: "685ff55ec786614448169720", name: "", color: "blue", uses: 0 }
  ],
  
  get_comments: [
    {
      id: "686001b5f01ce8a518b3c703",
      idMemberCreator: "685f2dcc98b9cd58c2e69153",
      data: {
        idCard: "685ff7151dd5a6e9f1825c46",
        text: "✅ **Phase 1 Infrastructure COMPLETE** (2025-06-28)\n\n**Key Achievements:**\n🏗️ **TokenMeasurement Class**: Singleton utility with tiktoken integration\n🔧 **MCP Integration**: All 85+ tools automatically wrapped with measurement\n📊 **Test Validation**: Infrastructure tested and confirmed working (23-729 token range)\n📋 **Test Scenarios**: Documented baseline test scenarios for all major operations\n\n**Technical Implementation:**\n- `src/utils/token-measurement.ts`: Complete token counting infrastructure  \n- `src/index.ts`: MCP server wrapper measuring all tool calls\n- `test-scenarios.md`: Comprehensive baseline testing documentation\n- Real-time token logging to stderr (MCP-compatible)\n\n**Status**: Foundation complete, ready for Phase 2 Response Filtering implementation.\n\n**Next**: Collect real baseline measurements and begin response optimization design.",
        textData: { emoji: {} },
        card: { id: "685ff7151dd5a6e9f1825c46", name: "Establish token usage baseline measurements", idShort: 1, shortLink: "MoLdOxqD" },
        board: { id: "685ff55ec786614448169720", name: "Trello MCP Optimizations", shortLink: "uh0a5437" },
        list: { id: "685ff6d394ae809cdfad1622", name: "📋 Phase 1: Foundation & Analysis" }
      },
      appCreator: { id: "685f30ad539163c12e9ecb41" },
      type: "commentCard",
      date: "2025-06-28T14:52:37.973Z",
      limits: { reactions: { perAction: { status: "ok", disableAt: 900, warnAt: 720 }, uniquePerAction: { status: "ok", disableAt: 17, warnAt: 14 } } },
      display: { translationKey: "action_comment_on_card", entities: {} },
      memberCreator: { id: "685f2dcc98b9cd58c2e69153", activityBlocked: false, avatarHash: "febeb8f645efbe20ec05c56c7867271b", avatarUrl: "https://trello-members.s3.amazonaws.com/685f2dcc98b9cd58c2e69153/febeb8f645efbe20ec05c56c7867271b", fullName: "Deepankar Singh", idMemberReferrer: null, initials: "DS", nonPublic: {}, nonPublicAvailable: true, username: "deepankarsingh16" }
    }
  ],
  
  get_attachments: [],
  get_card_members: [],
  get_label: { id: "685ff55ec78661444816975f", idBoard: "685ff55ec786614448169720", name: "", color: "green", uses: 2 },
  get_card_labels: [{ id: "685ff55ec78661444816975f", idBoard: "685ff55ec786614448169720", name: "", color: "green", uses: 2 }],
  get_checkitems: [
    { id: "685ff87e6239bb493ce1bb5f", name: "Set up token counting infrastructure", nameData: { emoji: {} }, pos: 140737488355328, state: "complete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
    { id: "685ff87e461112dfdf9e2f35", name: "Create test scenarios for each tool operation", nameData: { emoji: {} }, pos: 140737488371712, state: "complete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
    { id: "685ff87f605993f40d0d441a", name: "Measure tokens for get_boards operation", nameData: { emoji: {} }, pos: 140737488388096, state: "incomplete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
    { id: "685ff87f8a56201b94a7e40f", name: "Measure tokens for get_cards_in_list operation", nameData: { emoji: {} }, pos: 140737488404480, state: "incomplete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
    { id: "685ff88054b4d8ac2fbbb6d0", name: "Measure tokens for get_board_lists operation", nameData: { emoji: {} }, pos: 140737488420864, state: "incomplete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" },
    { id: "685ff880e5f9accd66951b20", name: "Document baseline metrics in spreadsheet", nameData: { emoji: {} }, pos: 140737488437248, state: "incomplete", due: null, dueReminder: null, idMember: null, idChecklist: "685ff873df2ffa50f4aeaa55" }
  ],
  search_members: [
    { id: "685f2dcc98b9cd58c2e69153", fullName: "Deepankar Singh", username: "deepankarsingh16", avatarUrl: "https://trello-members.s3.amazonaws.com/685f2dcc98b9cd58c2e69153/50.png" }
  ],
  get_member_boards: [
    { id: "685ff55ec786614448169720", name: "Trello MCP Optimizations", shortUrl: "https://trello.com/b/uh0a5437", closed: false }
  ]
};

// Operations to measure
const OPERATIONS_TO_MEASURE = [
  { tool: 'get_board', args: { boardId: '685ff55ec786614448169720' }, category: 'board' },
  { tool: 'get_board_lists', args: { boardId: '685ff55ec786614448169720' }, category: 'board' },
  { tool: 'get_board_members', args: { boardId: '685ff55ec786614448169720' }, category: 'board' },
  { tool: 'get_board_labels', args: { boardId: '685ff55ec786614448169720' }, category: 'board' },
  { tool: 'get_card', args: { cardId: '685ff7151dd5a6e9f1825c46' }, category: 'card' },
  { tool: 'get_cards_in_list', args: { listId: '685ff6d394ae809cdfad1622' }, category: 'card' },
  { tool: 'get_comments', args: { cardId: '685ff7151dd5a6e9f1825c46' }, category: 'card' },
  { tool: 'get_attachments', args: { cardId: '685ff7151dd5a6e9f1825c46' }, category: 'card' },
  { tool: 'get_card_members', args: { cardId: '685ff7151dd5a6e9f1825c46' }, category: 'card' },
  { tool: 'get_list', args: { listId: '685ff6d394ae809cdfad1622' }, category: 'list' },
  { tool: 'get_me', args: {}, category: 'member' },
  { tool: 'get_member', args: { memberIdOrUsername: 'me' }, category: 'member' },
  { tool: 'get_member_boards', args: { memberIdOrUsername: 'me' }, category: 'member' },
  { tool: 'get_label', args: { labelId: '685ff55ec78661444816975f' }, category: 'label' },
  { tool: 'get_card_labels', args: { cardId: '685ff7151dd5a6e9f1825c46' }, category: 'label' },
  { tool: 'get_checklist', args: { checklistId: '685ff873df2ffa50f4aeaa55' }, category: 'checklist' },
  { tool: 'get_checkitems', args: { checklistId: '685ff873df2ffa50f4aeaa55' }, category: 'checklist' },
  { tool: 'search_members', args: { query: 'test' }, category: 'search' }
];

async function collectBaselines() {
  console.log('🚀 Starting Baseline Token Measurements (Mock Mode)\n');
  console.log(`📋 Testing ${OPERATIONS_TO_MEASURE.length} operations with mock data\n`);
  
  // Initialize token measurement
  const tokenMeasurer = TokenMeasurement.getInstance();
  tokenMeasurer.clear();
  
  const results = [];
  const summaryByCategory = {};
  
  // Helper to determine operation type
  function getOperationType(toolName) {
    if (toolName.includes('search')) return 'search';
    if (toolName.includes('get_boards') || toolName.includes('get_cards_in_list') || toolName.includes('get_board_lists')) return 'list';
    if (toolName.includes('create') || toolName.includes('update') || toolName.includes('delete') || toolName.includes('add') || toolName.includes('remove')) return 'write';
    return 'read';
  }
  
  for (const operation of OPERATIONS_TO_MEASURE) {
    console.log(`\n📊 Measuring: ${operation.tool}`);
    console.log(`   Category: ${operation.category}`);
    
    const mockResponse = MOCK_RESPONSES[operation.tool] || {};
    const operationType = getOperationType(operation.tool);
    
    // Measure the mock operation
    const { result, measurement } = await tokenMeasurer.measureToolCall(
      operation.tool,
      operation.args,
      operationType,
      () => Promise.resolve(mockResponse)
    );
    
    const measurementData = {
      ...operation,
      ...measurement,
      timestamp: new Date().toISOString()
    };
    
    results.push(measurementData);
    
    // Update category summary
    if (!summaryByCategory[operation.category]) {
      summaryByCategory[operation.category] = {
        operations: [],
        totalTokens: 0,
        avgTokens: 0
      };
    }
    summaryByCategory[operation.category].operations.push(measurementData);
    
    console.log(`   ✅ Success: ${measurement.totalTokens} tokens`);
    console.log(`      Request: ${measurement.requestTokens} tokens`);
    console.log(`      Response: ${measurement.responseTokens} tokens`);
    console.log(`      Time: ${measurement.executionTime}ms`);
    console.log(`      Size: ${measurement.responseSize} bytes`);
  }
  
  // Calculate summaries
  Object.keys(summaryByCategory).forEach(category => {
    const ops = summaryByCategory[category].operations;
    const totalTokens = ops.reduce((sum, op) => sum + op.totalTokens, 0);
    summaryByCategory[category].totalTokens = totalTokens;
    summaryByCategory[category].avgTokens = Math.round(totalTokens / ops.length);
  });
  
  // Sort results by token usage
  const sortedResults = [...results].sort((a, b) => b.totalTokens - a.totalTokens);
  const top10 = sortedResults.slice(0, 10);
  
  // Identify token hotspots (>1000 tokens)
  const tokenHotspots = results.filter(r => r.totalTokens > 1000);
  
  // Generate comprehensive report
  const report = {
    metadata: {
      timestamp: new Date().toISOString(),
      mode: 'MOCK_DATA',
      boardId: '685ff55ec786614448169720',
      boardName: 'Trello MCP Optimizations',
      totalOperationsMeasured: results.length,
      totalOperationsPlanned: OPERATIONS_TO_MEASURE.length
    },
    
    summaryByCategory,
    
    top10HighestTokenOperations: top10.map(op => ({
      tool: op.tool,
      category: op.category,
      totalTokens: op.totalTokens,
      requestTokens: op.requestTokens,
      responseTokens: op.responseTokens,
      responseSize: op.responseSize,
      executionTime: op.executionTime
    })),
    
    tokenHotspots: tokenHotspots.map(op => ({
      tool: op.tool,
      category: op.category,
      totalTokens: op.totalTokens,
      percentOfResponse: Math.round((op.responseTokens / op.totalTokens) * 100)
    })),
    
    statistics: {
      current: {
        avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length),
        medianTokens: sortedResults[Math.floor(sortedResults.length / 2)]?.totalTokens || 0,
        maxTokens: Math.max(...results.map(r => r.totalTokens)),
        minTokens: Math.min(...results.map(r => r.totalTokens)),
        totalTokensAllOperations: results.reduce((sum, r) => sum + r.totalTokens, 0),
        avgResponseSize: Math.round(results.reduce((sum, r) => sum + r.responseSize, 0) / results.length),
        avgExecutionTime: Math.round(results.reduce((sum, r) => sum + r.executionTime, 0) / results.length)
      },
      
      optimizationTargets: {
        '60_percent_reduction': {
          avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.4),
          maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.4),
          totalSavings: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.6)
        },
        '70_percent_reduction': {
          avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.3),
          maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.3),
          totalSavings: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.7)
        },
        '85_percent_reduction': {
          avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.15),
          maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.15),
          totalSavings: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.85)
        },
        '90_percent_reduction': {
          avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.1),
          maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.1),
          totalSavings: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.9)
        }
      }
    },
    
    detailedMeasurements: results.map(r => ({
      tool: r.tool,
      category: r.category,
      operationType: r.operationType,
      totalTokens: r.totalTokens,
      requestTokens: r.requestTokens,
      responseTokens: r.responseTokens,
      responseSize: r.responseSize,
      executionTime: r.executionTime,
      tokensPerByte: (r.totalTokens / r.responseSize).toFixed(3),
      timestamp: r.timestamp
    })),
    
    recommendations: {
      highPriorityOptimizations: tokenHotspots.map(op => op.tool),
      potentialFieldsToFilter: [
        'prefs (board preferences - often not needed)',
        'badges (card badges - can be minimized)',
        'descData (description metadata)',
        'limits (API limits info)',
        'nodeId (internal identifiers)',
        'sharedSourceUrl (image URLs)',
        'backgroundImageScaled (multiple image sizes)',
        'labelNames (30 color variations)',
        'switcherViews (UI preferences)',
        'datasource (internal metadata)'
      ],
      suggestedDetailLevels: {
        minimal: 'Only essential fields (id, name, key properties)',
        standard: 'Common fields for typical use cases',
        detailed: 'All fields except metadata and preferences',
        full: 'Complete response (current behavior)'
      }
    }
  };
  
  // Save detailed report
  const reportPath = './baseline-measurements-report.json';
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Save summary report
  const summaryReport = {
    timestamp: report.metadata.timestamp,
    mode: 'MOCK_DATA',
    summary: `Measured ${results.length} operations with average ${report.statistics.current.avgTokensPerOperation} tokens per operation`,
    tokenHotspots: report.tokenHotspots,
    top5Operations: report.top10HighestTokenOperations.slice(0, 5),
    categoryBreakdown: Object.entries(summaryByCategory).map(([cat, data]) => ({
      category: cat,
      avgTokens: data.avgTokens,
      operations: data.operations.length
    })),
    targets: {
      current: report.statistics.current.avgTokensPerOperation,
      target60: report.statistics.optimizationTargets['60_percent_reduction'].avgTokensPerOperation,
      target85: report.statistics.optimizationTargets['85_percent_reduction'].avgTokensPerOperation
    }
  };
  
  const summaryPath = './baseline-summary.json';
  writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
  console.log(`📄 Summary report saved to: ${summaryPath}`);
  
  // Display results
  console.log('\n' + '='.repeat(50));
  console.log('   BASELINE MEASUREMENT RESULTS (MOCK DATA)');
  console.log('='.repeat(50) + '\n');
  
  console.log(`📊 Total Operations Measured: ${results.length}`);
  console.log(`⏱️  Average Execution Time: ${report.statistics.current.avgExecutionTime}ms`);
  console.log(`📏 Average Response Size: ${report.statistics.current.avgResponseSize} bytes`);
  
  console.log(`\n📈 Token Usage Statistics:`);
  console.log(`   Average: ${report.statistics.current.avgTokensPerOperation} tokens/operation`);
  console.log(`   Median: ${report.statistics.current.medianTokens} tokens`);
  console.log(`   Maximum: ${report.statistics.current.maxTokens} tokens`);
  console.log(`   Minimum: ${report.statistics.current.minTokens} tokens`);
  console.log(`   Total: ${report.statistics.current.totalTokensAllOperations} tokens`);
  
  console.log(`\n📊 Token Usage by Category:`);
  Object.entries(summaryByCategory).forEach(([category, data]) => {
    console.log(`   ${category.padEnd(10)}: ${data.avgTokens} avg tokens (${data.operations.length} operations)`);
  });
  
  if (tokenHotspots.length > 0) {
    console.log(`\n🔥 Token Hotspots (>1000 tokens): ${tokenHotspots.length} operations`);
    tokenHotspots.forEach(op => {
      console.log(`   - ${op.tool}: ${op.totalTokens} tokens (${op.percentOfResponse}% in response)`);
    });
  }
  
  console.log(`\n🏆 Top 5 Highest Token Operations:`);
  top10.slice(0, 5).forEach((op, i) => {
    console.log(`   ${i + 1}. ${op.tool}: ${op.totalTokens} tokens (${op.responseSize} bytes)`);
  });
  
  console.log(`\n🎯 Optimization Targets:`);
  console.log(`   Current Average: ${report.statistics.current.avgTokensPerOperation} tokens/operation`);
  console.log(`   60% Reduction: ${report.statistics.optimizationTargets['60_percent_reduction'].avgTokensPerOperation} tokens/operation (save ${report.statistics.optimizationTargets['60_percent_reduction'].totalSavings} tokens)`);
  console.log(`   70% Reduction: ${report.statistics.optimizationTargets['70_percent_reduction'].avgTokensPerOperation} tokens/operation (save ${report.statistics.optimizationTargets['70_percent_reduction'].totalSavings} tokens)`);
  console.log(`   85% Reduction: ${report.statistics.optimizationTargets['85_percent_reduction'].avgTokensPerOperation} tokens/operation (save ${report.statistics.optimizationTargets['85_percent_reduction'].totalSavings} tokens)`);
  
  console.log('\n✅ Baseline measurements complete (using mock data)!');
  console.log('⚠️  Note: These measurements use mock data. Run with actual Trello API for accurate results.');
  
  // Export raw measurements from TokenMeasurement instance
  const rawMeasurements = tokenMeasurer.exportMeasurements();
  writeFileSync('./baseline-raw-measurements.json', rawMeasurements);
  console.log('📄 Raw measurements exported to: ./baseline-raw-measurements.json');
}

// Run baseline measurements
collectBaselines().catch(console.error);