import { ArrowRight } from "lucide-react";

/**
 * The opening screen. Copy is verbatim from `Mindshield.dc.html`.
 */

const STEPS = [
  {
    index: "01",
    title: "Read the argument",
    detail: "One short claim at a time, no time pressure.",
  },
  {
    index: "02",
    title: "Name what's happening",
    detail: "Pick the fallacy at play, or say the reasoning holds up.",
  },
  {
    index: "03",
    title: "Learn as you go",
    detail: "Unsure of a term? Check its meaning before you answer.",
  },
];

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-[560px]">
        <div className="card-kicker">Critical thinking, five minutes at a time</div>
        <h1 className="mt-2">Spot the fallacy</h1>
        <p className="text-justify">
          Five short arguments. Some are sound; some lean on a rhetorical trick to
          feel more convincing than they are. Read each one, name what&rsquo;s
          happening, and see why.
        </p>

        <div className="hr" />

        <div className="mb-6 flex flex-col gap-4">
          {STEPS.map((step) => (
            <div key={step.index} className="flex gap-3">
              <div className="step-index" aria-hidden="true">
                {step.index}
              </div>
              <div>
                <strong>{step.title}</strong>
                <div className="text-muted text-[13px]">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={onStart}>
          Start the quiz
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
