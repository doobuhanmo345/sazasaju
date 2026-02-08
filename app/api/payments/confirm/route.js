import { NextResponse } from 'next/server';
import admin, { adminDb } from '@/lib/firebaseAdmin';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

export async function POST(req) {
    try {
        const body = await req.json();
        const { paymentKey, orderId, amount, userId, creditsToAdd } = body;

        console.log('=== Payment Confirm Start ===');
        console.log('Request Body:', body);
        console.log('Firebase Admin DB:', adminDb ? 'Available' : 'NOT AVAILABLE');
        console.log('Toss Secret Key:', TOSS_SECRET_KEY ? 'Set' : 'NOT SET');

        // 1. Confirm payment with Toss Payments
        const encryptedSecretKey = "Basic " + Buffer.from(TOSS_SECRET_KEY + ":").toString("base64");

        console.log('Calling Toss API...');
        const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
            method: "POST",
            headers: {
                Authorization: encryptedSecretKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderId,
                amount,
                paymentKey,
            }),
        });

        console.log('Toss API Response Status:', response.status);
        const paymentResult = await response.json();
        console.log('Toss API Response:', paymentResult);

        if (!response.ok) {
            console.error('Toss Verification Failed:', paymentResult);
            return NextResponse.json(
                { message: paymentResult.message || 'Payment confirmation failed', code: paymentResult.code },
                { status: response.status }
            );
        }

        let updatedCredits = 0; // capture new credits

        if (adminDb) {
            console.log('Updating Firestore...');
            const userRef = adminDb.collection('users').doc(userId);
            const paymentRef = adminDb.collection('payments').doc(orderId);

            updatedCredits = await adminDb.runTransaction(async (t) => {
                const userDoc = await t.get(userRef);

                let currentCredits = 0;
                if (userDoc.exists) {
                    const data = userDoc.data();
                    currentCredits = data.credits || 0;
                }

                const newCredits = currentCredits + creditsToAdd;

                t.set(userRef, { credits: newCredits }, { merge: true });

                t.set(paymentRef, {
                    userId,
                    orderId,
                    paymentKey,
                    amount,
                    creditsAdded: creditsToAdd,
                    status: 'DONE',
                    method: paymentResult.method,
                    requestedAt: paymentResult.requestedAt,
                    approvedAt: paymentResult.approvedAt,
                    paymentData: paymentResult,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                return newCredits; // Return newCredits from transaction
            });

            console.log(`Successfully added ${creditsToAdd} credits to user ${userId}. Total: ${updatedCredits}`);
        } else {
            console.warn('Firebase Admin not initialized - skipping DB update');
        }

        return NextResponse.json({
            success: true,
            message: 'Payment confirmed and credits updated',
            totalCredits: updatedCredits, // Include in response
            data: paymentResult
        });

    } catch (error) {
        console.error('=== Payment Confirmation Error ===');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);

        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}