// ===========================================
// ColorLab AI — Email Templates (Resend)
// ===========================================
// Use these with the Resend API for lead nurturing.
// Trigger: after waitlist signup via /api/leads

export const emailTemplates = {
  // Email 1: Welcome (sent immediately on signup)
  welcome: {
    subject: "You're on the ColorLab AI waitlist! 🎨",
    html: (name?: string) => `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 540px; margin: 0 auto; color: #3D2E1F; background: #FAF9F7; padding: 40px 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #C8874B, #B87333); line-height: 48px; text-align: center; color: white; font-size: 20px;">⚗</div>
        </div>
        <h1 style="font-size: 28px; font-weight: 500; text-align: center; margin: 0 0 16px;">Welcome to ColorLab AI</h1>
        <p style="color: #8A7E72; line-height: 1.8; font-size: 16px;">
          ${name ? `Hey ${name}! ` : ''}You're now on the early access list for the AI-powered formula engine built specifically for professional colorists.
        </p>
        <p style="color: #8A7E72; line-height: 1.8; font-size: 16px;">
          Here's what you get, completely free during our beta:
        </p>
        <ul style="color: #3D2E1F; line-height: 2; font-size: 15px; padding-left: 20px;">
          <li>Upload client + inspo photos → get instant formula</li>
          <li>AI-detected hair level, tone, and condition analysis</li>
          <li>Matched against a curated database of proven transformations</li>
          <li>Complete formula with shades, developer, ratios, and timing</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{APP_URL}}/upload" style="display: inline-block; background: #3D2E1F; color: #FAF9F7; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-size: 15px; font-weight: 500;">Try It Free Now →</a>
        </div>
        <hr style="border: none; border-top: 1px solid #E8DFD5; margin: 32px 0;" />
        <p style="color: #C4B5A5; font-size: 12px; text-align: center;">
          ColorLab AI · Smart formulas for professional colorists<br/>
          <a href="{{APP_URL}}" style="color: #C8874B; text-decoration: none;">colorlab.ai</a>
        </p>
      </div>
    `,
  },

  // Email 2: How It Works (send 2 days after signup)
  howItWorks: {
    subject: "See ColorLab AI in action (30 seconds) ✨",
    html: () => `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 540px; margin: 0 auto; color: #3D2E1F; background: #FAF9F7; padding: 40px 32px; border-radius: 12px;">
        <h1 style="font-size: 26px; font-weight: 500; text-align: center; margin: 0 0 24px;">How ColorLab AI Works</h1>
        <div style="background: #F5F0EB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="color: #3D2E1F; font-weight: 600; margin: 0 0 8px;">Step 1: Upload Two Photos</p>
          <p style="color: #8A7E72; font-size: 14px; margin: 0;">Snap your client's current hair and the inspo photo they showed you. That's it.</p>
        </div>
        <div style="background: #F5F0EB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="color: #3D2E1F; font-weight: 600; margin: 0 0 8px;">Step 2: AI Analyzes Both</p>
          <p style="color: #8A7E72; font-size: 14px; margin: 0;">Our AI detects the hair level (1-10), tone, condition, and porosity from the photos — then compares against hundreds of proven before/after transformations.</p>
        </div>
        <div style="background: #F5F0EB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="color: #3D2E1F; font-weight: 600; margin: 0 0 8px;">Step 3: Get Your Formula</p>
          <p style="color: #8A7E72; font-size: 14px; margin: 0;">Receive the exact shades, developer volume, lightener, toner, ratios, processing times, and step-by-step technique. Ready to mix.</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{APP_URL}}/upload" style="display: inline-block; background: #3D2E1F; color: #FAF9F7; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-size: 15px; font-weight: 500;">Try Your First Formula →</a>
        </div>
        <hr style="border: none; border-top: 1px solid #E8DFD5; margin: 32px 0;" />
        <p style="color: #C4B5A5; font-size: 12px; text-align: center;">
          ColorLab AI · <a href="{{APP_URL}}" style="color: #C8874B; text-decoration: none;">colorlab.ai</a>
        </p>
      </div>
    `,
  },

  // Email 3: Social proof + urgency (send 5 days after signup)
  socialProof: {
    subject: "Stylists are loving this — have you tried it yet?",
    html: () => `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 540px; margin: 0 auto; color: #3D2E1F; background: #FAF9F7; padding: 40px 32px; border-radius: 12px;">
        <h1 style="font-size: 26px; font-weight: 500; text-align: center; margin: 0 0 8px;">Stylists Are Talking</h1>
        <p style="color: #8A7E72; text-align: center; margin: 0 0 32px; font-size: 15px;">Here's what early beta users are saying:</p>
        
        <div style="background: #F5F0EB; border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 3px solid #C8874B;">
          <p style="color: #3D2E1F; font-style: italic; margin: 0 0 8px; font-size: 15px;">"I used to spend 20 minutes figuring out a formula for new clients. Now it's instant. Game changer."</p>
          <p style="color: #C4B5A5; font-size: 12px; margin: 0;">— Beta tester, Los Angeles</p>
        </div>
        
        <div style="background: #F5F0EB; border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 3px solid #C8874B;">
          <p style="color: #3D2E1F; font-style: italic; margin: 0 0 8px; font-size: 15px;">"My assistants can now prep formula cards before the client even sits down."</p>
          <p style="color: #C4B5A5; font-size: 12px; margin: 0;">— Beta tester, Miami</p>
        </div>
        
        <p style="color: #8A7E72; line-height: 1.8; font-size: 15px; margin-top: 24px;">
          ColorLab AI is <strong style="color: #3D2E1F;">free during beta</strong> — but we'll be introducing premium tiers soon. Lock in your access now while it's completely free.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{APP_URL}}/upload" style="display: inline-block; background: #C8874B; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-size: 15px; font-weight: 500;">Get Your Free Formula →</a>
        </div>
        <hr style="border: none; border-top: 1px solid #E8DFD5; margin: 32px 0;" />
        <p style="color: #C4B5A5; font-size: 12px; text-align: center;">
          ColorLab AI · <a href="{{APP_URL}}" style="color: #C8874B; text-decoration: none;">colorlab.ai</a>
        </p>
      </div>
    `,
  },
};
