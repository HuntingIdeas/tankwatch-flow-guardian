# Tankwatch Flow Guardian

Create a futuristic, dark-mode industrial web application for a "Hardware-Level Real-Time Fluid Threshold & Overfill Protection System". 

Key features to include:

1. Input Controls: Two sets of 4-bit binary toggle switches representing Input A (Sensor Level: A3, A2, A1, A0) and Input B (Threshold Limit: B3, B2, B1, B0), showing live decimal values from 0 to 15.

2. Visual Fluid Tank: An animated vertical water tank container on the side that fills up dynamically based on Input A's value, with a dashed marker line showing the threshold limit set by Input B.

3. System State Monitor: Three status indicator cards with glowing LEDs and animations:

   - A = B -> Optimal (Green LED)

   - A < B -> Refill Needed (Yellow LED)

   - A > B -> Critical Overfill Warning (Red LED + Pulsing Alarm)

4. Local Session Log: A bottom table recording recent overfill trigger events with timestamps when A > B occurs.

5. Styling: Tailwind CSS, slate-950 dark background, cyan/emerald/rose neon glow accents, clean card layout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5cdbf1de-52a8-4e61-a499-16aa5c8669b9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
