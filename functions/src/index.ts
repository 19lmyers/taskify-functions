import {initializeApp} from 'firebase-admin/app';
import {getMessaging, MulticastMessage} from "firebase-admin/messaging";

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

const app = initializeApp();

const messaging = getMessaging(app)

export const notificationReminder = onRequest( async (request, response) => {
    logger.info("Received notification payload (reminder)");

    const taskId = request.body.taskId;
    const taskName = request.body.taskName;

    const tokens: string[] = request.body.tokens
    if (tokens == undefined || tokens.length === 0) return

    logger.info(`Sending notifications to ${tokens.length} devices`);

    const message: MulticastMessage = {
        data: {
            DATA_MESSAGE_TYPE: "MESSAGE_TYPE_REMINDER",
            DATA_TASK_ID: taskId,
        },
        apns: {
            payload: {
                aps: {
                    category: 'reminder',
                    alert: {
                        title: taskName
                    }
                }
            }
        },
        tokens: tokens
    };

    const fcm = await messaging.sendEachForMulticast(message);

    const failedTokens: string[] = [];
    if (fcm.failureCount > 0) {
        fcm.responses.forEach((resp, idx) => {
            if (!resp.success) {
                if (resp.error?.code == "messaging/registration-token-not-registered") {
                    failedTokens.push(tokens[idx]);
                } else {
                    logger.error(resp.error?.message)
                }
            }
        });
    }

    logger.info(`Returning response - failedTokenCount of ${failedTokens.length}`);

    response.status(200).send({
        successCount: fcm.successCount,
        failureCount: fcm.failureCount,
        failedTokens: failedTokens
    });
})

export const notificationAction = onRequest(async (request, response) => {
    logger.info("Received notification payload (action)");

    const actor = request.body.actor;
    const action = request.body.action;
    const taskId = request.body.taskId;
    const taskName = request.body.taskName;

    //const workspaceName = request.body.workspaceName;
    //const categoryName = request.body.categoryName;

    let actionLabel = "";

    switch (action) {
        case "AddTask":
            actionLabel = `${actor} added`
            break
        case "RemoveTask":
            actionLabel = `${actor} removed`
            break
        case "CompleteTask":
            actionLabel = `${actor} completed`
            break
    }

    const tokens: string[] = request.body.tokens
    if (tokens == undefined || tokens.length === 0) return

    logger.info(`Sending notifications to ${tokens.length} devices`);

    const message: MulticastMessage = {
        data: {
            DATA_MESSAGE_TYPE: "MESSAGE_TYPE_ACTION",
            DATA_TASK_ID: taskId,
            DATA_ACTOR: actor,
            DATA_ACTION: action
        },
        apns: {
            payload: {
                aps: {
                    category: 'action',
                    alert: {
                        title: taskName,
                        body: actionLabel
                    },
                }
            }
        },
        tokens: tokens
    };

    const fcm = await messaging.sendEachForMulticast(message);

    const failedTokens: string[] = [];
    if (fcm.failureCount > 0) {
        fcm.responses.forEach((resp, idx) => {
            if (!resp.success) {
                if (resp.error?.code == "messaging/registration-token-not-registered") {
                    failedTokens.push(tokens[idx]);
                } else {
                    logger.error(resp.error?.message)
                }
            }
        });
    }

    logger.info(`Returning response - failedTokenCount of ${failedTokens.length}`);

    response.status(200).send({
        successCount: fcm.successCount,
        failureCount: fcm.failureCount,
        failedTokens: failedTokens
    });
});


export const notificationAssign = onRequest(async (request, response) => {
    logger.info("Received notification payload (assign)");

    const actor = request.body.actor;
    const taskId = request.body.taskId;
    const taskName = request.body.taskName;

    //const workspaceName = request.body.workspaceName;
    //const categoryName = request.body.categoryName;

    const tokens: string[] = request.body.tokens
    if (tokens == undefined || tokens.length === 0) return

    logger.info(`Sending notifications to ${tokens.length} devices`);

    const message: MulticastMessage = {
        data: {
            DATA_MESSAGE_TYPE: "MESSAGE_TYPE_ASSIGNED",
            DATA_TASK_ID: taskId,
            DATA_ACTOR: actor
        },
        apns: {
            payload: {
                aps: {
                    category: 'assigned',
                    alert: {
                        title: taskName,
                        body: `${actor} assigned to you`
                    }
                }
            }
        },
        tokens: tokens
    };

    const fcm = await messaging.sendEachForMulticast(message);

    const failedTokens: string[] = [];
    if (fcm.failureCount > 0) {
        fcm.responses.forEach((resp, idx) => {
            if (!resp.success) {
                if (resp.error?.code == "messaging/registration-token-not-registered") {
                    failedTokens.push(tokens[idx]);
                } else {
                    logger.error(resp.error?.message)
                }
            }
        });
    }

    logger.info(`Returning response - failedTokenCount of ${failedTokens.length}`);

    response.status(200).send({
        successCount: fcm.successCount,
        failureCount: fcm.failureCount,
        failedTokens: failedTokens
    });
});
