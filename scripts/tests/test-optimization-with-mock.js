/**
 * Test script to measure token reduction with optimization
 * Using mock data that represents typical Trello API responses
 */

import { responseOptimizer } from './build/utils/response-optimizer.js';

// Mock data representing typical Trello responses
const mockBoardData = {
    id: "5d5f9f5a5f5d5f5d5f5d5f5d",
    name: "Project Board",
    desc: "This is a project board for testing",
    descData: {
        emoji: {}
    },
    closed: false,
    idOrganization: "5d5f9f5a5f5d5f5d5f5d5f5e",
    idEnterprise: null,
    pinned: false,
    url: "https://trello.com/b/5d5f9f5a/project-board",
    shortUrl: "https://trello.com/b/5d5f9f5a",
    shortLink: "5d5f9f5a",
    starred: false,
    memberships: [],
    dateLastActivity: "2023-12-28T10:30:00.000Z",
    dateLastView: "2023-12-28T10:30:00.000Z",
    idTags: [],
    datePluginDisable: null,
    creationMethod: null,
    ixUpdate: "12345",
    templateGallery: null,
    enterpriseOwned: false,
    idBoardSource: null,
    premiumFeatures: [
        "additionalBoardBackgrounds",
        "additionalStickers",
        "customBoardBackgrounds"
    ],
    idMemberCreator: "5d5f9f5a5f5d5f5d5f5d5f5f",
    nodeId: "ari:cloud:trello::board/5d5f9f5a5f5d5f5d5f5d5f5d",
    // Large nested objects that consume many tokens
    prefs: {
        permissionLevel: "private",
        hideVotes: false,
        voting: "disabled",
        comments: "members",
        invitations: "members",
        selfJoin: true,
        cardCovers: true,
        isTemplate: false,
        cardAging: "regular",
        calendarFeedEnabled: false,
        background: "blue",
        backgroundImage: null,
        backgroundImageScaled: null,
        backgroundTile: false,
        backgroundBrightness: "dark",
        backgroundBottomColor: "#0079BF",
        backgroundTopColor: "#0079BF",
        canBePublic: true,
        canBeEnterprise: true,
        canBeOrg: true,
        canBePrivate: true,
        canInvite: true
    },
    labelNames: {
        green: "Priority",
        yellow: "Review",
        orange: "Blocked",
        red: "Urgent",
        purple: "Feature",
        blue: "Bug",
        sky: "Enhancement",
        lime: "Documentation",
        pink: "Testing",
        black: "Technical Debt",
        green_dark: "",
        yellow_dark: "",
        orange_dark: "",
        red_dark: "",
        purple_dark: "",
        blue_dark: "",
        sky_dark: "",
        lime_dark: "",
        pink_dark: "",
        black_dark: "",
        green_light: "",
        yellow_light: "",
        orange_light: "",
        red_light: "",
        purple_light: "",
        blue_light: "",
        sky_light: "",
        lime_light: "",
        pink_light: "",
        black_light: ""
    },
    limits: {
        attachments: {
            perBoard: {
                status: "ok",
                disableAt: 36000,
                warnAt: 32400
            },
            perCard: {
                status: "ok",
                disableAt: 1000,
                warnAt: 900
            }
        },
        boards: {
            totalMembersPerBoard: {
                status: "ok",
                disableAt: 1600,
                warnAt: 1400
            }
        },
        cards: {
            openPerBoard: {
                status: "ok",
                disableAt: 5000,
                warnAt: 4500
            },
            openPerList: {
                status: "ok",
                disableAt: 5000,
                warnAt: 4500
            },
            totalPerBoard: {
                status: "ok",
                disableAt: 2000000,
                warnAt: 1800000
            },
            totalPerList: {
                status: "ok",
                disableAt: 1000000,
                warnAt: 900000
            }
        },
        checklists: {
            perBoard: {
                status: "ok",
                disableAt: 1800000,
                warnAt: 1620000
            },
            perCard: {
                status: "ok",
                disableAt: 500,
                warnAt: 450
            }
        },
        labels: {
            perBoard: {
                status: "ok",
                disableAt: 1000,
                warnAt: 900
            }
        },
        lists: {
            openPerBoard: {
                status: "ok",
                disableAt: 500,
                warnAt: 450
            },
            totalPerBoard: {
                status: "ok",
                disableAt: 3000,
                warnAt: 2700
            }
        }
    },
    powerUps: [],
    dateLastUpdate: "2023-12-28T10:30:00.000Z"
};

const mockCardsData = [
    {
        id: "5d5f9f5a5f5d5f5d5f5d5f5g",
        name: "Implement user authentication",
        desc: "Add OAuth2 authentication for users",
        descData: {
            emoji: {}
        },
        closed: false,
        idBoard: "5d5f9f5a5f5d5f5d5f5d5f5d",
        idList: "5d5f9f5a5f5d5f5d5f5d5f5h",
        idMembers: ["5d5f9f5a5f5d5f5d5f5d5f5f"],
        idLabels: ["5d5f9f5a5f5d5f5d5f5d5f5i"],
        idChecklists: ["5d5f9f5a5f5d5f5d5f5d5f5j"],
        pos: 65536,
        due: "2023-12-30T12:00:00.000Z",
        dueComplete: false,
        dueReminder: null,
        start: null,
        shortLink: "5d5f9f5a",
        shortUrl: "https://trello.com/c/5d5f9f5a",
        url: "https://trello.com/c/5d5f9f5a/1-implement-user-authentication",
        dateLastActivity: "2023-12-28T10:30:00.000Z",
        email: null,
        idAttachmentCover: null,
        badges: {
            attachmentsByType: {
                trello: {
                    board: 0,
                    card: 0
                }
            },
            location: false,
            votes: 0,
            viewingMemberVoted: false,
            subscribed: false,
            fogbugz: "",
            checkItems: 5,
            checkItemsChecked: 2,
            checkItemsEarliestDue: null,
            comments: 3,
            attachments: 2,
            description: true,
            due: "2023-12-30T12:00:00.000Z",
            dueComplete: false,
            start: null
        },
        checkItemStates: [],
        cover: {
            idAttachment: null,
            color: null,
            idUploadedBackground: null,
            size: "normal",
            brightness: "dark"
        },
        customFieldItems: [],
        isTemplate: false,
        labels: [
            {
                id: "5d5f9f5a5f5d5f5d5f5d5f5i",
                idBoard: "5d5f9f5a5f5d5f5d5f5d5f5d",
                name: "Feature",
                color: "purple"
            }
        ],
        limits: {
            attachments: {
                perCard: {
                    status: "ok",
                    disableAt: 1000,
                    warnAt: 900
                }
            },
            checklists: {
                perCard: {
                    status: "ok",
                    disableAt: 500,
                    warnAt: 450
                }
            },
            stickers: {
                perCard: {
                    status: "ok",
                    disableAt: 70,
                    warnAt: 63
                }
            }
        },
        idOrganization: "5d5f9f5a5f5d5f5d5f5d5f5e",
        pinned: false,
        pluginData: [],
        manualCoverAttachment: false
    },
    // Second card with similar structure
    {
        id: "5d5f9f5a5f5d5f5d5f5d5f5k",
        name: "Fix navigation bug",
        desc: "Navigation menu not working on mobile",
        descData: { emoji: {} },
        closed: false,
        idBoard: "5d5f9f5a5f5d5f5d5f5d5f5d",
        idList: "5d5f9f5a5f5d5f5d5f5d5f5h",
        idMembers: [],
        idLabels: ["5d5f9f5a5f5d5f5d5f5d5f5l"],
        idChecklists: [],
        pos: 131072,
        due: null,
        dueComplete: false,
        dueReminder: null,
        start: null,
        shortLink: "5d5f9f5b",
        shortUrl: "https://trello.com/c/5d5f9f5b",
        url: "https://trello.com/c/5d5f9f5b/2-fix-navigation-bug",
        dateLastActivity: "2023-12-28T09:00:00.000Z",
        email: null,
        idAttachmentCover: null,
        badges: {
            attachmentsByType: {
                trello: {
                    board: 0,
                    card: 0
                }
            },
            location: false,
            votes: 2,
            viewingMemberVoted: false,
            subscribed: true,
            fogbugz: "",
            checkItems: 0,
            checkItemsChecked: 0,
            checkItemsEarliestDue: null,
            comments: 1,
            attachments: 0,
            description: true,
            due: null,
            dueComplete: false,
            start: null
        },
        checkItemStates: [],
        cover: {
            idAttachment: null,
            color: "red",
            idUploadedBackground: null,
            size: "normal",
            brightness: "light"
        },
        customFieldItems: [],
        isTemplate: false,
        labels: [
            {
                id: "5d5f9f5a5f5d5f5d5f5d5f5l",
                idBoard: "5d5f9f5a5f5d5f5d5f5d5f5d",
                name: "Bug",
                color: "red"
            }
        ],
        limits: {
            attachments: {
                perCard: {
                    status: "ok",
                    disableAt: 1000,
                    warnAt: 900
                }
            },
            checklists: {
                perCard: {
                    status: "ok",
                    disableAt: 500,
                    warnAt: 450
                }
            },
            stickers: {
                perCard: {
                    status: "ok",
                    disableAt: 70,
                    warnAt: 63
                }
            }
        },
        idOrganization: "5d5f9f5a5f5d5f5d5f5d5f5e",
        pinned: false,
        pluginData: [],
        manualCoverAttachment: false
    }
];

// Function to estimate token count (rough estimate: 1 token ≈ 4 characters)
function estimateTokens(data) {
    const jsonString = JSON.stringify(data);
    return Math.round(jsonString.length / 4);
}

// Test optimization
function testOptimization() {
    console.log('=== Token Optimization Test Results ===\n');
    
    // Test get_board optimization
    console.log('📊 Operation: get_board');
    console.log('─'.repeat(50));
    
    const originalBoardTokens = estimateTokens(mockBoardData);
    console.log(`Original: ${originalBoardTokens} tokens (${JSON.stringify(mockBoardData).length} chars)`);
    
    const levels = ['minimal', 'standard', 'detailed', 'full'];
    for (const level of levels) {
        const optimized = responseOptimizer.optimize(mockBoardData, 'get_board', { level });
        const optimizedTokens = estimateTokens(optimized);
        const reduction = Math.round((1 - optimizedTokens / originalBoardTokens) * 100);
        
        console.log(`${level.padEnd(10)}: ${optimizedTokens} tokens (${reduction}% reduction)`);
        
        if (level !== 'full') {
            console.log(`  Fields: ${Object.keys(optimized).join(', ')}`);
        }
    }
    
    // Test get_cards_in_list optimization
    console.log('\n\n📊 Operation: get_cards_in_list');
    console.log('─'.repeat(50));
    
    const originalCardsTokens = estimateTokens(mockCardsData);
    console.log(`Original: ${originalCardsTokens} tokens (${JSON.stringify(mockCardsData).length} chars)`);
    
    for (const level of levels) {
        const optimized = responseOptimizer.optimize(mockCardsData, 'get_cards_in_list', { level });
        const optimizedTokens = estimateTokens(optimized);
        const reduction = Math.round((1 - optimizedTokens / originalCardsTokens) * 100);
        
        console.log(`${level.padEnd(10)}: ${optimizedTokens} tokens (${reduction}% reduction)`);
        
        if (level !== 'full' && optimized[0]) {
            console.log(`  Fields: ${Object.keys(optimized[0]).join(', ')}`);
        }
    }
    
    // Show optimization stats
    console.log('\n\n📈 Optimization Statistics');
    console.log('─'.repeat(50));
    
    const boardStats = responseOptimizer.getOptimizationStats(
        mockBoardData,
        responseOptimizer.optimize(mockBoardData, 'get_board', { level: 'standard' }),
        'get_board'
    );
    
    console.log('get_board (standard level):');
    console.log(`  Character reduction: ${boardStats.reductionPercentage}%`);
    console.log(`  Estimated token saving: ${boardStats.estimatedTokenReduction} tokens`);
    
    const cardsStats = responseOptimizer.getOptimizationStats(
        mockCardsData,
        responseOptimizer.optimize(mockCardsData, 'get_cards_in_list', { level: 'standard' }),
        'get_cards_in_list'
    );
    
    console.log('\nget_cards_in_list (standard level):');
    console.log(`  Character reduction: ${cardsStats.reductionPercentage}%`);
    console.log(`  Estimated token saving: ${cardsStats.estimatedTokenReduction} tokens`);
    
    // Compare with Phase 1 targets
    console.log('\n\n🎯 Phase 1 Target Comparison');
    console.log('─'.repeat(50));
    console.log('Target: 85% reduction');
    console.log(`get_board achieved: ${boardStats.reductionPercentage}% (standard level)`);
    console.log(`get_cards_in_list achieved: ${cardsStats.reductionPercentage}% (standard level)`);
}

// Run the test
testOptimization();