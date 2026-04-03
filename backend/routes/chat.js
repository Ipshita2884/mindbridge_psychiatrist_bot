const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const http = require('http');
const { authenticate } = require('../middleware/auth');

/**
 * ── OLLAMA LOCAL AI INTEGRATION (ATOMIC PULSE-OLLAMA v1.0) ──────────────────
 *    Calls the local Ollama API (http://localhost:11434)
 */

const callOllama = (model, systemPrompt, userMessage, images = []) => {
    return new Promise((resolve, reject) => {
        const payload = {
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage, images: images }
            ],
            stream: false
        };
        const data = JSON.stringify(payload);
        
        const options = {
            hostname: 'localhost',
            port: 11434,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode === 200) resolve(parsed.message.content);
                    else reject(new Error(`Ollama Error ${res.statusCode}: ${parsed.error || 'Unknown error'}`));
                } catch (e) {
                    reject(new Error("Failed to parse Ollama response"));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Ollama Connection Failed: ${e.message}. Is Ollama running?`));
        });

        req.setTimeout(120000, () => {
            req.destroy();
            reject(new Error("Ollama Request Timed Out - Your computer is thinking..."));
        });

        req.write(data);
        req.end();
    });
};

/**
 * ── AURA VISION SCAN (OLLAMA LLAVA-SYNC) ───────────────────────────────────
 */
router.post('/scan', authenticate, async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ success: false, message: 'Bio-data required' });
        const base64Data = image.split(',')[1];
        
        let analysis;
        try {
            console.log("🤖 Scanning with Ollama (Llava)...");
            const systemPrompt = "Analyze person's emotion and stress. Return ONLY a JSON object: {\"mood\": \"string\", \"stress\": 0-100, \"recommendation\": \"string\", \"insight\": \"string\"}. Do not talk, just JSON.";
            const userMsg = "Analyze this image.";
            
            let aiRes;
            try {
                aiRes = await callOllama('llava', systemPrompt, userMsg, [base64Data]);
            } catch (e) {
                console.log("⚠️ Retrying with llava:latest...");
                aiRes = await callOllama('llava:latest', systemPrompt, userMsg, [base64Data]);
            }
            
            // ROBUST JSON EXTRACTION: Find the first { and the last }
            const jsonMatch = aiRes.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found in AI response");
            
            analysis = JSON.parse(jsonMatch[0].trim());
            console.log("✅ OLLAMA VISION SUCCESS");
        } catch (e) {
            console.warn("⚠️ Vision AI parse failed, using fallback:", e.message);
            analysis = { mood: "Analyzing...", stress: 50, recommendation: "Relax and breath", insight: `Local AI: ${e.message}` };
        }

        try { 
            await supabase
                .from('users')
                .update({ 
                    stress_level: analysis.stress, 
                    last_analysis: new Date().toISOString() 
                })
                .eq('id', req.user.id);
        } catch (e) {}

        res.json({ success: true, analysis });
    } catch (error) {
        res.status(500).json({ success: false, message: "Interface resonance lost." });
    }
});

/**
 * ── AURA CHATBOT (OLLAMA TINYLLAMA-SYNC) ──────────────────────────────────
 */
router.post('/ai', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Neural input missing' });

        let reply;
        try {
            console.log("🤖 Thinking with Ollama (Consultant Mode - Phi-3 Smart)...");
            const systemPrompt = "You are Aura, a professional psychiatrist. Be clinical, empathetic, and direct. Respond only to the user's message and stay in character. Do not repeat the prompt.";
            
            // 🌐 UNIVERSAL AI FALLBACK CHAIN (MindBridge Omni-Model Search)
            let modelsToTry = ['phi3', 'phi3:latest', 'phi3:mini', 'phi3:small', 'llama3', 'llama3:latest', 'mistral', 'gemma', 'tinyllama'];
            
            for (let modelName of modelsToTry) {
                try {
                    console.log(`🤖 Neural Bridge: Attempting connection via ${modelName}...`);
                    reply = await callOllama(modelName, systemPrompt, message);
                    console.log(`✅ SUCCESS: Neural resonance established with [${modelName}]`);
                    break; // STOP ONCE WE FIND A WORKING MODEL
                } catch (e) {
                    continue; // TRY NEXT
                }
            }

            if (!reply) throw new Error("No neural model found. Please run 'ollama run phi3'");
            console.log("✅ OLLAMA CHAT SUCCESS");
        } catch (aiErr) {
            console.error("❌ Ollama Chat Error:", aiErr.message);
            reply = `Aura System Diagnostic: [Local AI Link Blocked]. ${aiErr.message}`;
        }
        res.json({ success: true, reply: reply.trim() });
    } catch (error) {
        res.json({ success: true, reply: "I am listening. Re-establishing local neural bridge..." });
    }
});

module.exports = router;