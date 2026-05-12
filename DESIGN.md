# 🎨 Web Speech Selector | Design System & Visual Identity

> A practical **Design System Manifest** detailing the visual aesthetics, user experience logic, and styling tokens underpinning the Web Speech Selector user interface.

---

## 🌌 1. Aesthetic Direction: "POP Arcade" Neo-Brutalism

To break away from standard web application layouts and generic flat designs, this project adopts a tactile, high-contrast **Neo-Brutalist** visual system. 

The goal is to create a delightful space that feels like a classic **2D arcade cabinet** or an intuitive **digital audio dashboard**. It is designed to be highly readable, clear, and fun to interact with.

---

## 🎨 2. Color Token Mapping

The user interface pairs dark background surfaces with bright, highly saturated interactive accents. Each primary color is tied directly to a specific functional category to aid fast visual scanning:

| Token | Palette Hue (HEX / Tailwind) | Interface Context | Functional Role |
| :--- | :--- | :--- | :--- |
| **Ink Base** | `#090d16` / `#0b0f19` | Main layout backgrounds & text input areas | Provides maximum contrast and reduces eye strain. |
| **Surfaces** | `#0f172a` (`slate-900`) | Structural layout panels & control cards | Groups related settings cleanly. |
| **Neon Violet**| `indigo-500` / `violet-600` | Voice list containers & AI prompt actions | Represents language models, voice identities, and prompt formatting. |
| **Vivid Rose** | `pink-500` / `rose-500` | Audio calibration sliders & Stop controls | Serves as a clear, high-visibility signal for precise acoustic calibration. |
| **Pure Cyan** | `cyan-400` / `cyan-500` | Live speech engine & Play buttons | Indicates active playback, testing zones, and positive feedback. |
| **Golden Amber**| `amber-400` / `amber-500` | Implementation snippets & Starred voices | Highlights exportable source code and user persistent favorites. |

---

## 🕹️ 3. Tactile 2D Arcade Buttons

Primary action buttons are rendered with an elevated appearance and distinct active-state scaling to provide satisfying tactile feedback.

### Button Component Anatomy
* **Bottom Accent Border**: Thick bottom colored borders (`border-b-4 border-[color]-700` or `border-slate-950`) emulate the physical height of a real arcade button.
* **Typography**: Primary call-to-action labels utilize bold font weights (`font-black`) to ensure clear legibility.
* **Active Press Feedback**: Clicking the button instantly scales the container down (`active:scale-95`) while visually flattening the lower border, delivering the tactile sensation of a physical button click.
* **Action Symmetry**: The **Play** button (bright cyan base) mirrors the **Stop** button (vivid rose base) perfectly. This color pairing keeps core speech controls clear and avoids guesswork during repetitive testing.

---

## 📐 4. Layout Hierarchy & Containment

### Typography Rules
* **Section Headers**: Styled in bold uppercase text with generous letter spacing (`text-xs font-black uppercase tracking-wider`) for excellent dashboard readability.
* **Colored Prefix Dots**: Main panel headers include a small colored inline circular badge (`<span class="w-2 h-2 rounded-full bg-[color]"></span>`) to match the surrounding container's color token.
* **Source Code Blocks**: Rendered in clear monospace formatting with custom token highlight styling set against a dark background (`#060912`) to support easy copying.

### Structural Containment
* **Responsive CSS Grid**: Employs an asymmetric layout grid (`4 columns for settings / 8 columns for preview areas`) on desktop displays, scaling down cleanly into a stacked view on smaller viewports.
* **Horizontal Scrollbar Protection**: Flex items inside lists incorporate the CSS utility `min-w-0` paired with `overflow-x-hidden` containers. This forces excessively long native voice names to truncate cleanly with standard ellipses (`truncate`), avoiding broken flex wraps or messy horizontal scrollbars.

---

## 🌟 5. Ambient Elements

* **Volumetric Background Glows**: Large circular elements are placed in background fixed layers with wide blurring values (`filter: blur(120px)`) and screen blending modes (`mix-blend-screen`). They loop continuously using gentle keyframe shifts (`@keyframes blob`), adding a lively ambient feel to the workspace without distracting from foreground readability.
* **Micro-Interactions**: Features clean inline indicators (such as pulse animations on active audio flags) to keep the user's focus grounded during live playback synthesis.

---

## ♿ 6. Accessibility Integration (A11Y)

The design system incorporates structural accessibility directly into its styling workflows:
* **WCAG AAA Contrast**: Pairing bright primary texts against pure dark backgrounds provides high-scoring contrast values across every page section.
* **Visible Outline Tracking**: Focus states maintain structured styling boundaries to assist non-mouse navigation.
* **Consistent Layout Boundaries**: The UI elements are strictly dimensioned to ensure text status updates do not trigger jarring layout shifts when alternating between idle and speaking states.
