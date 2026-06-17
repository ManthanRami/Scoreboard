# Scoreboard Hub: Virality & Growth Strategy

*Objective: Leverage the social nature of game nights to turn every user into a distributor via Product-Led Growth (PLG).*

## Phase 1: The "Bragging Rights" Loop (Shareable Recaps)
The highest point of emotional engagement is the end of the game. We need to capitalize on the winner's desire to brag to their friends.
*   **Action Item:** Implement a "Share Recap" feature on the Game Over/Celebration screen.
*   **Mechanism:** Use the Web Share API and a library like `html-to-image` to generate a stylized, social-media-ready image of the final scoreboard (similar to Spotify Wrapped).
*   **Viral Hook:** Include a clean, subtle watermark on the generated image: *"Tracked effortlessly with ScoreboardHub.app"*. When the image is texted to the group chat or posted on Instagram, it acts as an organic ad.

## Phase 2: Zero-Friction Acquisition (In-Person Sharing)
When someone at the table asks about the app, the acquisition process must take less than 5 seconds.
*   **Action Item:** Build a "Share App" modal accessible from the main navigation.
*   **Mechanism:** When tapped, the modal displays a large QR code linking directly to the PWA URL.
*   **Viral Hook:** Friends can simply point their phone cameras at the host's screen to instantly load the app in their own browser. Because it's a PWA, there is no app store search, no password creation, and zero download wait time.

## Phase 3: The Trojan Horse (Pass-and-Play Mechanics)
The Traitor (Mafia) game is the strongest acquisition tool because it forces every player to physically interact with the application.
*   **Action Item:** Continuously polish the "Hold to Reveal" UI and the Moderator Dashboard. Ensure the haptics and animations are flawless.
*   **Mechanism:** During the role reveal phase, every guest touches the sleek interface. The host acts as the product evangelist simply by running the game.
*   **Viral Hook:** When those guests host their own parties with different social circles, they will remember the seamless tool that ran the game and seek it out.

## Phase 4: Viral Customization (Shareable "Home Rules")
Game groups naturally develop custom rules (like the High Stakes Kachuful variant). We can use this to drive acquisition.
*   **Action Item:** Expand the settings to allow users to create, name, and save custom scoring variants.
*   **Mechanism:** Allow these custom rulesets to be encoded into a shareable URL (e.g., `scoreboardhub.app/play/kachuful?ruleset=xyz`).
*   **Viral Hook:** When a group creates a popular variant (e.g., a specific drinking game ruleset), they share the link. Anyone clicking the link instantly gets the app pre-configured with that exact game mode.

## Phase 5: SEO for "Table Arguments" (Content Funnel)
Players frequently pause games to Google rule clarifications. We want to own that search traffic.
*   **Action Item:** Create beautifully formatted, static rule pages for each game (e.g., `/rules/hearts`, `/rules/kachuful`) optimized for search engines.
*   **Mechanism:** When someone Googles "Can you lead with a Heart on the first trick?", they land on our definitive rule guide.
*   **Viral Hook:** Prominently feature a call-to-action on the rule page: *"Tired of doing the math? Track scores automatically with our free app."* This converts search traffic looking for rules directly into app users.
