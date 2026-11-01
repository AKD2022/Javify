# Intentional app design rules

Established October 31, 2026 at the user's request. Apply to future Javify UI work. These rules prioritize product fit, clarity, and consistency over generic AI-generated styling. They are reusable for other projects after defining that project's audience and identity.

## 1. Start with the screen's job

Before a substantial UI change, write down: who uses it, the task, the most important information, the next action, and the states it must support. For Javify the direction is a calm, precise Java study tool.

A lesson should help someone understand Java. A results screen should explain their attempt and where to review. A bookmark should help them recover saved material. Avoid giving all three the same hero/card/CTA composition.

For a redesign, compare two plausible information structures before choosing one. Explain the choice in terms of the student's task. Routine spacing fixes do not need a new design proposal.

## 2. No automatic decoration recipe

Do not automatically add purple gradients, glass panels, glow, blobs, sparkles, oversized numbers, score rings, all-caps eyebrow labels, or a grid of rounded cards because the request says “make it better.” Use them only when they communicate something specific.

As a starting budget, allow one decorative focal treatment per screen and no decorative gradient in ordinary lesson-reading or answer-review surfaces. Existing approved treatments may remain; this rule controls future expansion rather than demanding their immediate removal.

Do not replace these defaults with equally arbitrary beige-and-serif, brutalist, or dark-neon styling. Familiar components are allowed. Novelty must earn its cost.

## 3. Color has a job

Use a neutral canvas, readable foreground, one principal brand accent, and semantic feedback colors. Purple is allowed as Javify's existing accent; a rebrand is a separate design decision.

Reserve the accent for primary actions, selection, navigation state, and purposeful emphasis. Avoid tinting every content container. Give correctness, errors, warnings, and disabled states distinct meanings, with text or symbols as well as color.

Use shared semantic tokens rather than introducing slightly different purples and grays in each screen. Check actual foreground/background combinations, including gradient endpoints and states. Aim for at least 4.5:1 ordinary text contrast and 3:1 qualifying large text contrast; do not round a failing result up.

## 4. Typography serves reading

Choose fonts for legibility, Java character distinction, brand fit, and device rendering. Do not automatically select or reject Inter, Poppins, Roboto, or system fonts. Keep the current Poppins family until an intentional typography revision is requested.

Use one UI family and one monospace family for code by default. A display family needs a specific reason. Limit routine text to three weights and named roles: screen title, section title, body, metadata, action, code.

Starting mobile defaults: body 16 with about 24 line height; supporting text 13–14; section titles 18–20; screen titles 24–28. Adjust based on the actual font and accessibility scaling. Avoid shrinking useful text to preserve a screenshot composition.

Keep explanations left-aligned. Reserve centered text for short summaries. Test `0/O`, `1/l/I`, braces, indentation, and comparison operators. Use uppercase tracked text sparingly; do not put an ornamental label over every heading.

## 5. Buttons express priority

Each task region should have one clear primary action. Secondary actions receive quieter treatment. A destructive action should look destructive and stay separated from the normal workflow.

Use concise, literal labels: “Check answer,” “Review answers,” “Save study plan.” Do not add an arrow or sparkle to every action. Icons should clarify meaning or a known navigation action.

Use shared dimensions, padding, corner radii, and icon gaps. Center the icon-and-label group together. Allow long labels and font scaling to grow or stack the control. Provide pressed, disabled, loading, and failure behavior.

Target at least 48×48 dp on Android and 44×44 pt on iOS; distinguish hit target from visible icon size. Keep targets nonoverlapping. Preserve Javify's rounded controls and existing results action-panel design.

## 6. Choose the right structure before adding cards

Use rows for collections of comparable items; grouped sections for settings; an uninterrupted reading flow for lessons; aligned rows/bars for unit comparison. Use a card when it groups one distinct object or task.

Avoid cards inside cards for decoration. A heading, divider, or deliberate gap is often enough. Do not enforce a bento grid, a centered hero, or equal-size tiles on unrelated content.

Use the same component for the same job across screens, while allowing different tasks to have different layouts. Retain familiar tabs, back controls, and other platform conventions.

## 7. Spacing follows a system

Use a shared spacing scale such as 4, 8, 12, 16, 20, 24, 32. These are starting design tokens, not mandatory values for every optical adjustment.

Keep related items closer than unrelated sections. Establish common left/right content edges. Align numeric values, text baselines, icon centers, and action groups deliberately. Prefer layout constraints over absolute offsets.

For Javify, start with a 20-unit screen gutter, 16–20 content padding, and 24–32 between major sections. Use about 8 units between an inline action and its associated content unless the touch targets need more.

Compute sticky-footer clearance from safe-area insets plus an intentional gap. Keep scroll content reachable above the footer. Do not fix a cramped screen by shrinking text or adding arbitrary blank space elsewhere.

## 8. Shape and elevation explain grouping

Use a small radius scale with named roles; do not invent a radius per component. Different controls need not all be pills. Keep the user's rounded Java-term pills, with correct baseline alignment, and keep the rounded top corners of the results footer.

Shadows should indicate elevation or an interactive layer. Avoid shadowing every panel. Do not add border, shadow, tinted fill, and gradient together without a clear reason.

## 9. Information before celebration

Present the actual result and its denominator. A four-question quiz measures that attempt; it does not prove mastery of the whole topic. Diagnostic rankings describe sampled performance and determine review order, not an AP score prediction.

Use a ring only when a part-to-whole visualization helps. Prefer aligned bars for comparing unit performance. Never make a metric visually dominant merely because it is easy to animate.

Keep supportive language specific and truthful. Prefer “2 of 4 correct. Review the two missed answers” over interchangeable motivational slogans. Do not invent weak-topic claims unless the recorded answers support them.

## 10. Subject-specific detail creates identity

Let the Java content distinguish this app: traceable examples, readable syntax, useful topic labels, clear answer explanations, and meaningful review history. Decorative coding symbols are not a substitute for correct instructional material.

Only style actual code as code. English “this” is ordinary prose unless it refers to Java's `this`. Preserve code indentation and provide scrolling for long code when needed without hiding the question or controls.

If the app name and logo were removed, the content and workflow should still clearly belong to a Java study app.

## 11. Motion and icons remain restrained

Use one icon family and consistent size/weight for equivalent roles. Do not mix emoji, filled icons, outline icons, and ornamental symbols at random.

Animate state changes when motion helps explain what happened. Avoid automatic entrance animations for every card, continuous glow, and decorative activity while a student reads. Respect reduced-motion preferences and avoid delaying input.

## 12. Design the complete experience

Include empty, loading, error, offline/retry, long-content, and completed states where relevant. A saved answer must be distinguishable from the correct answer. A disabled action needs understandable context. Preserve existing persistence behavior when changing presentation.

Check a narrow phone, a larger phone, increased text size, long titles, multiline Java, and bottom safe areas. Inspect actual rendered screens rather than assuming a successful bundle proves visual quality.

## 13. Preserve the user's decisions

Keep rounded code pills, rounded buttons, the circular-back-header treatment, and the results footer unless the user asks to revise them. Keep the normal Review Answers screen unchanged unless specifically included in the request. Keep notifications paused until requested otherwise.

Do not add new features merely to make a redesign appear richer. Propose optional features for approval, as requested by the user. Routine fixes and already-authorized work do not require repeated approval.

## 14. Required review before calling UI work finished

- Can the student identify the next action immediately?
- Does the visual hierarchy match the task and actual content?
- Does every card, badge, icon, gradient, and chart serve a named purpose?
- Are colors, typography, spacing, radii, and controls using shared roles?
- Are icon/text baselines, content edges, and numeric columns aligned?
- Are buttons readable, reachable, separated, and responsive in every state?
- Do long content, increased text size, code, and safe areas work?
- Are feedback and progress claims accurate and understandable without color?
- Have relevant screens been inspected on a device/emulator or other appropriate renderer?
- If visual inspection was blocked, is that limitation explicitly reported?

A screen does not pass because it looks fashionable or avoids purple. It passes when its choices are coherent, useful, accessible, and specific to the product.

## Evidence and persistence

See Design-research.md for source links, evidence limits, and why individual fonts/colors cannot identify AI authorship. These rules are project preferences synthesized from that research, not a validated AI detector.

The project AGENTS.md points to this document so future agents working in the repository can load it. A copy is saved in this chat workspace. This is file-based continuity, not a promise of automatic memory across unrelated chats or projects.
