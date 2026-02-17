import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, subjectName, quizTitle } = body;
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error('DISCORD_WEBHOOK_URL not set');
            return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
        }

        // Use the explicit public URL for stability
        const publicBaseUrl = 'https://syllabus-os.vercel.app';

        // Configuration for Embeds
        const config = {
            subject: {
                title: '📘 New Subject Added to the Website',
                description: `# [${subjectName}](${publicBaseUrl})`,
                color: 0x004E98, // XP-style blue
                image: `${publicBaseUrl}/windows/new-subject.png`
            },
            quiz: {
                title: '📝 New Quiz Added to the Website',
                description: `**Subject:** ${subjectName}\n# [${quizTitle}](${publicBaseUrl})`,
                color: 0x00AA00, // System-style green
                image: `${publicBaseUrl}/windows/new-quiz.png`
            }
        };

        const embedData = type === 'subject' ? config.subject : config.quiz;

        const discordPayload = {
            content: '@everyone',
            embeds: [
                {
                    title: embedData.title,
                    description: embedData.description,
                    color: embedData.color,
                    image: {
                        url: embedData.image
                    },
                    footer: {
                        text: 'Syllabus System'
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Discord API responded with ${response.status}: ${errorText}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Discord Webhook Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' });
    }
}
