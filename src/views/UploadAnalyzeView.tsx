import React, { useState, useRef } from 'react';
import { Project, ImageObservation, AIAnalysisResult, ConstructionStageId } from '../types';
import { CONSTRUCTION_STAGES, getStageById } from '../constants/stages';
import { analyzeImage, saveObservation, correctObservationCategory } from '../services/api';

interface UploadAnalyzeViewProps {
  projects: Project[];
  onObservationSaved: (obs: ImageObservation) => void;
  onNavigate: (view: string) => void;
}

export const UploadAnalyzeView: React.FC<UploadAnalyzeViewProps> = ({
  projects,
  onObservationSaved,
  onNavigate,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<ConstructionStageId>(
    'STAGE_03_SUPERSTRUCTURE'
  );
  const [observationDate, setObservationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [inspectorName, setInspectorName] = useState<string>('Er. Rajesh Sharma (QA/QC)');
  const [locationTag, setLocationTag] = useState<string>('Grid Lines B-4 / Floor Level 3');
  const [notes, setNotes] = useState<string>('');

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [sha256Hash, setSha256Hash] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [savedObservation, setSavedObservation] = useState<ImageObservation | null>(null);

  // Category Correction Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [correctedCategory, setCorrectedCategory] = useState<ConstructionStageId>('STAGE_04_MASONRY');
  const [correctionEngineer, setCorrectionEngineer] = useState<string>('Er. Vikram Menon (Chief Structural QA)');
  const [correctionReason, setCorrectionReason] = useState<string>(
    'Field verification confirmed masons are laying AAC partition walls; contractor erroneously submitted under facade milestone.'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute SHA-256 for client-side fingerprinting
  async function computeHash(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Real magic byte inspection
  function validateMagicBytes(bytes: Uint8Array): { isValid: boolean; detectedMime: string } {
    if (bytes.length < 12) {
      return { isValid: false, detectedMime: '' };
    }
    // JPEG
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { isValid: true, detectedMime: 'image/jpeg' };
    }
    // PNG
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return { isValid: true, detectedMime: 'image/png' };
    }
    // WebP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return { isValid: true, detectedMime: 'image/webp' };
    }
    return { isValid: false, detectedMime: '' };
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSavedObservation(null);

    // Size limit check (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setValidationError('File size exceeds 25 MB limit.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const { isValid, detectedMime } = validateMagicBytes(bytes);

      if (!isValid) {
        setValidationError(
          'Security check failed: File header does not contain authentic JPEG, PNG, or WebP binary magic bytes.'
        );
        return;
      }

      const hash = await computeHash(buffer);
      setSha256Hash(hash);
      setMimeType(detectedMime);
      setFileName(file.name.replace(/[^a-zA-Z0-9._-]/g, '_'));
      setFileSizeBytes(file.size);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setValidationError('Failed to parse image file: ' + err.message);
    }
  };

  // Quick Load Benchmark Samples
  const loadBenchmarkSample = async (
    sampleName: string,
    path: string,
    stage: ConstructionStageId,
    sampleNotes: string
  ) => {
    setValidationError(null);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSavedObservation(null);

    try {
      const res = await fetch(path);
      const blob = await res.blob();
      const buffer = await blob.arrayBuffer();
      const hash = await computeHash(buffer);

      setFileName(`${sampleName}.jpg`);
      setFileSizeBytes(blob.size);
      setMimeType('image/jpeg');
      setSha256Hash(hash);
      setImagePreview(path);
      setSelectedCategory(stage);
      setNotes(sampleNotes);
    } catch (err) {
      setImagePreview(path);
      setFileName(`${sampleName}.jpg`);
      setSelectedCategory(stage);
      setNotes(sampleNotes);
    }
  };

  // Trigger real AI analysis
  const handleRunAnalysis = async () => {
    if (!imagePreview) {
      setValidationError('Please select or capture a photograph first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const activeProject = projects.find((p) => p.id === selectedProjectId);

    try {
      const result = await analyzeImage({
        imageDataUri: imagePreview,
        selectedCategory,
        projectName: activeProject?.name || 'Building Construction Site',
        notes,
        observationDate,
        projectId: selectedProjectId,
      });

      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(
        err.message || 'Vision API request failed. The vision model may be experiencing high demand or rate limits.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Commit and save observation to database
  const handleCommitObservation = async () => {
    if (!imagePreview || !selectedProjectId) return;

    const activeProject = projects.find((p) => p.id === selectedProjectId);

    try {
      const newObs = await saveObservation({
        projectId: selectedProjectId,
        projectName: activeProject?.name,
        imageUrl: imagePreview,
        fileName: fileName || `site_photo_${Date.now()}.jpg`,
        fileSizeBytes: fileSizeBytes || 1500000,
        mimeType: mimeType || 'image/jpeg',
        fileSha256: sha256Hash || 'hash_' + Date.now(),
        observationDate,
        inspectorName,
        locationTag,
        selectedCategory,
        originalClaimedCategory: selectedCategory,
        notes,
        analysis: analysisResult || undefined,
        hasMismatchAlert: analysisResult ? !analysisResult.categoryMatch : false,
      });

      setSavedObservation(newObs);
      onObservationSaved(newObs);
    } catch (err: any) {
      setAnalysisError('Failed to save observation: ' + err.message);
    }
  };

  // Handle Category Correction preserving audit history
  const handleApplyCategoryCorrection = async () => {
    if (!savedObservation) {
      setSelectedCategory(correctedCategory);
      if (analysisResult) {
        setAnalysisResult({
          ...analysisResult,
          selectedCategory: correctedCategory,
          categoryMatch: analysisResult.predictedStage === correctedCategory,
        });
      }
      setShowCorrectionModal(false);
      return;
    }

    try {
      const updated = await correctObservationCategory(savedObservation.id, {
        newCategory: correctedCategory,
        correctedBy: correctionEngineer,
        reason: correctionReason,
      });

      setSavedObservation(updated);
      setSelectedCategory(correctedCategory);
      if (analysisResult) {
        setAnalysisResult({
          ...analysisResult,
          selectedCategory: correctedCategory,
          categoryMatch: analysisResult.predictedStage === correctedCategory,
        });
      }
      setShowCorrectionModal(false);
      onObservationSaved(updated);
      alert('Category correction logged. Original claimed category and engineer justification preserved in database audit trail.');
    } catch (err: any) {
      alert('Failed to log category correction: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
          <span className="font-mono text-stone-600">IS 456 / NBC 2016</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>Multimodal Vision Audit</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
          Image Upload & Stage Classification
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
          Submit site photographs with expected activity metadata. The multimodal vision model inspects structural elements, verifies activity alignment, and flags category discrepancies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Image Intake (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Labelled Benchmark Test Suite */}
          <div className="bg-white p-4 rounded-xs border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-stone-900">
                Labelled Benchmark Reference Suite
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                Ground-Truth Samples
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() =>
                  loadBenchmarkSample(
                    'Foundation_Footings_Reference',
                    '/src/assets/images/construction_foundation_stage_1792592932880.jpg',
                    'STAGE_01_FOUNDATION',
                    'Excavation pits, steel rebar footings, lean concrete blinding poured.'
                  )
                }
                className="p-2 text-left bg-stone-50 rounded-xs border border-stone-200 hover:border-amber-700 hover:bg-white transition-colors cursor-pointer text-xs"
              >
                <div className="font-medium text-stone-900 truncate">1. Foundation</div>
                <div className="text-[10px] text-stone-500 truncate">Rebar trenches</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadBenchmarkSample(
                    'Superstructure_RCC_Frame_Reference',
                    '/src/assets/images/construction_superstructure_stage_1792592933145.jpg',
                    'STAGE_03_SUPERSTRUCTURE',
                    'Reinforced concrete columns, slab shuttering propping, tower crane active.'
                  )
                }
                className="p-2 text-left bg-stone-50 rounded-xs border border-stone-200 hover:border-amber-700 hover:bg-white transition-colors cursor-pointer text-xs"
              >
                <div className="font-medium text-stone-900 truncate">2. Framing</div>
                <div className="text-[10px] text-stone-500 truncate">Crane & columns</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadBenchmarkSample(
                    'Masonry_Disagreement_Reference',
                    '/src/assets/images/construction_masonry_stage_1792592933480.jpg',
                    'STAGE_05_FACADE',
                    'Contractor claimed Facade Finishing for bill #3. Visual site evidence shows masonry brickwork.'
                  )
                }
                className="p-2 text-left bg-stone-50 rounded-xs border border-stone-200 hover:border-amber-700 hover:bg-white transition-colors cursor-pointer text-xs"
              >
                <div className="font-medium text-stone-900 truncate">3. Mismatch</div>
                <div className="text-[10px] text-amber-800 truncate">Claims Facade</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadBenchmarkSample(
                    'Curtain_Wall_Glazing_Reference',
                    '/src/assets/images/construction_facade_finishing_1792592933719.jpg',
                    'STAGE_05_FACADE',
                    'Curtain wall double glazing and ACP panel installation using suspended cradle platform.'
                  )
                }
                className="p-2 text-left bg-stone-50 rounded-xs border border-stone-200 hover:border-amber-700 hover:bg-white transition-colors cursor-pointer text-xs"
              >
                <div className="font-medium text-stone-900 truncate">4. Facade</div>
                <div className="text-[10px] text-stone-500 truncate">Curtain glazing</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadBenchmarkSample(
                    'Unsupported_NonConstruction_Desk',
                    '/src/assets/images/office_desk_laptop_1792597667725.jpg',
                    'STAGE_08_INTERIOR',
                    'Office desk with laptop and coffee cup. Negative test: verify model rejects non-construction photo.'
                  )
                }
                className="p-2 text-left bg-stone-50 rounded-xs border border-stone-200 hover:border-stone-400 hover:bg-white transition-colors cursor-pointer text-xs"
              >
                <div className="font-medium text-stone-900 truncate">5. Rejection</div>
                <div className="text-[10px] text-stone-500 truncate">Office desk test</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadBenchmarkSample(
                    'Excavation_Blurry_LowConfidence',
                    '/src/assets/images/blurry_excavation_low_confidence_1792597667954.jpg',
                    'STAGE_01_FOUNDATION',
                    'Rain-blurred excavation pit with heavy mist. Verify model handles low visual clarity.'
                  )
                }
                className="p-2 text-left bg-stone-50 rounded-xs border border-stone-200 hover:border-stone-400 hover:bg-white transition-colors cursor-pointer text-xs"
              >
                <div className="font-medium text-stone-900 truncate">6. Ambiguity</div>
                <div className="text-[10px] text-stone-500 truncate">Rain mist test</div>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white p-5 rounded-xs border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-stone-900">
              1. Photographic Evidence Intake
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-stone-300 hover:border-amber-700 rounded-xs p-6 text-center cursor-pointer transition-colors bg-stone-50/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Uploaded preview"
                    referrerPolicy="no-referrer"
                    className="max-h-72 mx-auto rounded-xs object-contain border border-stone-200"
                  />
                  <div className="text-xs text-stone-500 flex items-center justify-center gap-2">
                    <span className="font-medium text-stone-900">{fileName}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="font-mono tabular-nums">
                      {(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="font-mono text-[11px] text-stone-400">
                      SHA256: {sha256Hash.substring(0, 10)}...
                    </span>
                  </div>
                  <p className="text-xs text-amber-800">Click to replace photograph</p>
                </div>
              ) : (
                <div className="py-6">
                  <div className="text-sm font-medium text-stone-800">
                    Click to select site photograph or drop file here
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Accepts authentic JPEG, PNG, or WebP up to 25 MB
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Binary header validation enforces authentic image magic bytes
                  </div>
                </div>
              )}
            </div>

            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-800">
                <strong>Validation Warning:</strong> {validationError}
              </div>
            )}
          </div>

          {/* Metadata Parameters Form */}
          <div className="bg-white p-5 rounded-xs border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-stone-900">
              2. Observation Context & Claimed Category
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Target Construction Project *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.projectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Expected / Claimed Construction Stage *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ConstructionStageId)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-500"
                >
                  {CONSTRUCTION_STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.code}: {stage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Observation Date *
                </label>
                <input
                  type="date"
                  value={observationDate}
                  onChange={(e) => setObservationDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white font-mono text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Inspector / Engineer Name *
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="e.g. Er. Rajesh Sharma"
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Location Grid / Structural Zone
              </label>
              <input
                type="text"
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                placeholder="e.g. Tower C, Grid Lines A-D, Floor 7 Slab"
                className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Field Observation Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details regarding weather, equipment on site, pour schedule, contractor milestone claim..."
                className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                disabled={!imagePreview || isAnalyzing}
                onClick={handleRunAnalysis}
                className="px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Structural Evidence...</span>
                  </>
                ) : (
                  <span>Run Visual Stage Classification →</span>
                )}
              </button>

              <span className="text-xs text-stone-500 font-mono">
                Vision Engine: gemini-2.5-flash
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Automated Inspection Findings & Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {analysisError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-900 space-y-2">
              <div className="font-semibold">Vision Model Service Notice</div>
              <p className="leading-relaxed text-stone-700">{analysisError}</p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  className="px-2.5 py-1 bg-rose-900 text-white rounded-xs text-xs font-medium hover:bg-rose-800 cursor-pointer"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white p-8 rounded-xs border border-stone-200 shadow-xs text-center space-y-3">
              <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs font-medium text-stone-900">
                Executing Visual Stage Classification
              </div>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Evaluating structural members, formwork, cured concrete states, and matching against 10 civil engineering stages...
              </p>
            </div>
          )}

          {!analysisResult && !isAnalyzing && (
            <div className="bg-white p-8 rounded-xs border border-stone-200 shadow-xs text-center space-y-2">
              <div className="text-xs font-medium text-stone-800">
                Awaiting Photographic Analysis
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Upload or select an image on the left and trigger the visual inspection to generate classified construction stage, structural evidence, and category mismatch detection.
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="bg-white p-5 rounded-xs border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <div className="text-xs font-mono text-stone-500">
                    FINDINGS & CLASSIFICATION
                  </div>
                  <h3 className="text-base font-semibold text-stone-900">
                    {analysisResult.predictedStageName}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xs font-medium text-stone-800">
                    Certainty: {analysisResult.confidenceLevel}
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    Qualitative Assessment
                  </div>
                </div>
              </div>

              {/* Unsupported or Non-Construction Warning */}
              {analysisResult.predictedStage === 'STAGE_10_UNCLEAR' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900 space-y-1">
                  <div className="font-semibold">Potentially Unsuitable Image:</div>
                  <p>
                    The model was unable to confirm recognizable building structural activity due to extreme occlusion, blur, or non-construction subject matter. A replacement photograph is recommended.
                  </p>
                </div>
              )}

              {/* Category Mismatch Discrepancy Banner */}
              {!analysisResult.categoryMatch ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xs space-y-2">
                  <div className="text-xs font-semibold text-rose-900">
                    Stage Discrepancy Flagged
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {analysisResult.mismatchExplanation}
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCorrectedCategory(analysisResult.predictedStage);
                        setShowCorrectionModal(true);
                      }}
                      className="px-2.5 py-1 bg-white text-rose-900 font-medium rounded-xs border border-rose-300 hover:bg-rose-100 cursor-pointer"
                    >
                      Correct Category & Record History
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-900">
                  <span className="font-semibold">Stage Agreement Confirmed:</span> Visual structural evidence matches claimed stage ({analysisResult.predictedStageName}).
                </div>
              )}

              {/* Visible Construction Activities */}
              <div>
                <div className="text-xs font-medium text-stone-800 mb-1">
                  Visible Construction Activities:
                </div>
                <ul className="space-y-1 text-xs text-stone-600 list-disc list-inside">
                  {analysisResult.visibleActivities.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* Observable Structural Evidence */}
              <div>
                <div className="text-xs font-medium text-stone-800 mb-1">
                  Observable Structural Evidence:
                </div>
                <ul className="space-y-1 text-xs text-stone-600 list-disc list-inside">
                  {analysisResult.observableEvidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>

              {/* Materials & Elements Unboxed Metadata */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                <div className="text-xs text-stone-600">
                  <strong className="text-stone-800 font-medium">Identified Materials:</strong>{' '}
                  {analysisResult.visibleMaterials.join(' · ') || 'None specifically logged.'}
                </div>
                <div className="text-xs text-stone-600">
                  <strong className="text-stone-800 font-medium">Structural Members:</strong>{' '}
                  {analysisResult.structuralElements.join(' · ') || 'None specifically logged.'}
                </div>
              </div>

              {/* Engineering Limitations Note */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs text-stone-600 space-y-1">
                <div className="font-medium text-stone-800">
                  Engineering Scope & Limitation:
                </div>
                {analysisResult.uncertaintyAndLimitations.map((lim, i) => (
                  <p key={i}>• {lim}</p>
                ))}
              </div>

              {/* Recommended Site Action */}
              <div className="text-xs text-stone-700 bg-amber-50/60 p-3 rounded-xs border border-amber-200">
                <span className="font-semibold text-amber-950">Recommended Action:</span>{' '}
                {analysisResult.recommendedReviewAction}
              </div>

              {/* Category Correction History if present */}
              {savedObservation?.correctionHistory && savedObservation.correctionHistory.length > 0 && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs space-y-1.5">
                  <div className="font-medium text-stone-800">
                    Category Correction Audit History:
                  </div>
                  {savedObservation.correctionHistory.map((log, i) => (
                    <div key={i} className="text-[11px] text-stone-600 border-t border-stone-200 pt-1">
                      <div>
                        <strong>{log.correctedBy}</strong> updated stage from{' '}
                        <span className="line-through">{getStageById(log.previousCategory).name}</span> to{' '}
                        <strong>{getStageById(log.newCategory).name}</strong> on {log.timestamp.split('T')[0]}
                      </div>
                      <div className="italic text-stone-500 mt-0.5">Reason: {log.reason}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Commit & Save Observation */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                {savedObservation ? (
                  <div className="text-xs font-medium text-emerald-800 flex items-center gap-1.5">
                    <span>✓ Observation saved to SQLite database</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCommitObservation}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer"
                  >
                    Save Observation to Project
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="bg-white rounded-xs shadow-lg max-w-md w-full p-5 border border-stone-200 space-y-3.5">
            <h3 className="text-base font-semibold text-stone-900">
              Correct Observation Category
            </h3>
            <p className="text-xs text-stone-500">
              Preserves the original claimed category and analysis record in the permanent audit trail.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Adjusted Construction Stage *
                </label>
                <select
                  value={correctedCategory}
                  onChange={(e) => setCorrectedCategory(e.target.value as ConstructionStageId)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900"
                >
                  {CONSTRUCTION_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Reviewing Engineer Name *
                </label>
                <input
                  type="text"
                  value={correctionEngineer}
                  onChange={(e) => setCorrectionEngineer(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Technical Justification Reason *
                </label>
                <textarea
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="State basis for correction..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCategoryCorrection}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer"
              >
                Commit Category Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
