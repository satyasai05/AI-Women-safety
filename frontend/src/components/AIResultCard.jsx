const AIResultCard = ({ result }) => {
  if (!result) return null;

  return (
    <div className="rounded-[32px] bg-white/80 p-6 shadow-glass backdrop-blur">
      <h3 className="text-xl font-semibold text-slate-900">Detection Result</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="flex items-center justify-between rounded-3xl bg-slate-100 p-4">
          <span>Detected Object</span>
          <strong>{result.detected_object}</strong>
        </div>
        <div className="flex items-center justify-between rounded-3xl bg-slate-100 p-4">
          <span>Confidence</span>
          <strong>{result.confidence}%</strong>
        </div>
        <div className="flex items-center justify-between rounded-3xl bg-slate-100 p-4">
          <span>Threat Level</span>
          <strong>{result.threat_level}</strong>
        </div>
        <div className="rounded-3xl bg-slate-100 p-4 text-slate-700">
          <span className="font-semibold">Recommended Action</span>
          <p className="mt-2 text-sm text-slate-600">{result.recommended_action}</p>
        </div>
      </div>
      {result.annotated_image_path && (
        <img
          src={result.annotated_image_path}
          alt="Annotated"
          className="mt-6 w-full rounded-3xl object-cover"
        />
      )}
    </div>
  );
};

export default AIResultCard;
