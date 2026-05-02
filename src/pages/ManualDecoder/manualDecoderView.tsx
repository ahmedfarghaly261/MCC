import { useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Code } from "lucide-react";
import { useLayoutLoading } from "@/components/layout/layoutLoadingContext";
import ManualDecoderForm from "./composables/manualDecoderForm";
import ManualDecoderModePanel from "./composables/manualDecoderModePanel";
import ManualDecoderOutput from "./composables/manualDecoderOutput";
import ManualDecoderStats from "./composables/manualDecoderStats";
import {
  decodeManualBatch,
  decodeManualFrame,
} from "./services/manualDecoder.service";
import type {
  DecoderMode,
  ManualDecodeBatchRequest,
  ManualDecodeRequest,
  ManualDecoderResponse,
} from "./types/manualDecoder.types";

const SAMPLE_HEX_FRAME =
  "C0B0A347FF800E7A0FB30E3101A21F3400C405BF00001010100F0000030185C5648EA4A7EC2A873425B3A99B5CC28401C367F93719292F0C8D523D5FF492D91C92E89AA9AAEA9ECF0E310E690FB8019A1F4800A092890E91D88CA96ACA9ACC0FBE0F700FEB01751F3E00A091F904912874A92ABA9ACA10A30E1B0F0B01291F34009B9178FE90C86CA8AA9A9AC70F860EC20E2B01401F34009B9168F790185BA82A7A9EC30F160E3C0FEB015C1F3E00A09198F48FC84FA82A6AA2C10E310E6910D501391F34009B9198EF8EF83FA7EA5AA6BE1033108D0F4801731F3E00A091C8E88E482FA7EA3AAABB0E310E9B0EDE019F1F48009791C8E78E381EA7AA2AB2B70E310F05677CC0";
const SAMPLE_BATCH_FRAMES =
  "C0A1B00700ABCD12345678EF9A\nC0A2B00800BCDE23456789FA0B\nC0A3B00900CDEF34567890AB1C";
const MIN_HEX_LENGTH = 112;

export default function ManualDecoder() {
  const { setGlobalLoading } = useLayoutLoading();
  const [mode, setMode] = useState<DecoderMode>("normal");
  const [hexFrame, setHexFrame] = useState("");
  const [batchFrames, setBatchFrames] = useState("");
  const [frameIndex, setFrameIndex] = useState(0);
  const [capturedAt, setCapturedAt] = useState("");
  const [station, setStation] = useState("");
  const [decodedData, setDecodedData] =
    useState<ManualDecoderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hexCharCount = useMemo(
    () => hexFrame.replace(/\s/g, "").length,
    [hexFrame]
  );

  const frameCount = useMemo(() => {
    if (mode !== "batch") {
      return 1;
    }

    return batchFrames
      .split("\n")
      .map((frame) => frame.trim())
      .filter(Boolean).length;
  }, [batchFrames, mode]);

  const validateHexFrame = (hex: string): boolean =>
    /^[0-9A-Fa-f]+$/.test(hex.replace(/\s/g, ""));

  const handleClear = () => {
    setHexFrame("");
    setBatchFrames("");
    setFrameIndex(0);
    setCapturedAt("");
    setStation("");
    setDecodedData(null);
    setErrorMessage(null);
  };

  const handleModeChange = (nextMode: DecoderMode) => {
    setMode(nextMode);
    handleClear();
  };

  const loadSampleData = () => {
    if (mode === "normal") {
      setHexFrame(SAMPLE_HEX_FRAME);
      setFrameIndex(0);
    } else {
      setBatchFrames(SAMPLE_BATCH_FRAMES);
      setFrameIndex(0);
    }

    setCapturedAt(new Date().toISOString());
    setStation("GS-Cairo-01");
  };

  const buildRequest = (hexValue: string): ManualDecodeRequest => {
    const trimmedCapturedAt = capturedAt.trim();
    const trimmedStation = station.trim();

    return {
      hex_frame: hexValue,
      frame_index: frameIndex,
      captured_at: trimmedCapturedAt.length > 0 ? trimmedCapturedAt : null,
      station: trimmedStation.length > 0 ? trimmedStation : null,
    };
  };

  const buildBatchRequest = (frames: string[]): ManualDecodeBatchRequest => ({
    frames: frames.map((frame, index) => ({
      hex_frame: frame,
      frame_index: frameIndex + index,
    })),
  });

  const handleDecode = async () => {
    setErrorMessage(null);
    setDecodedData(null);

    let frameRequest: ManualDecodeRequest | null = null;
    let batchRequest: ManualDecodeBatchRequest | null = null;

    if (mode === "normal") {
      if (!hexFrame.trim()) {
        setErrorMessage("Hex frame is required.");
        return;
      }

      const cleanHex = hexFrame.replace(/\s/g, "");
      if (!validateHexFrame(cleanHex)) {
        setErrorMessage(
          "Invalid hex format. Only hexadecimal characters (0-9, A-F) are allowed."
        );
        return;
      }

      if (cleanHex.length % 2 !== 0) {
        setErrorMessage("Hex frame must have an even number of characters.");
        return;
      }

      if (cleanHex.length < MIN_HEX_LENGTH) {
        setErrorMessage(
          `Hex frame must be at least ${MIN_HEX_LENGTH} characters.`
        );
        return;
      }

      if (!Number.isInteger(frameIndex) || frameIndex < 0) {
        setErrorMessage("Frame index must be 0 or greater.");
        return;
      }

      frameRequest = buildRequest(cleanHex);
    } else {
      if (!batchFrames.trim()) {
        setErrorMessage("Batch frames are required.");
        return;
      }

      const frames = batchFrames
        .split("\n")
        .map((frame) => frame.trim())
        .filter(Boolean);

      if (frames.length === 0) {
        setErrorMessage("No valid frames found.");
        return;
      }

      if (frames.length > 500) {
        setErrorMessage("Maximum 500 frames allowed per batch.");
        return;
      }

      if (!Number.isInteger(frameIndex) || frameIndex < 0) {
        setErrorMessage("Frame index must be 0 or greater.");
        return;
      }

      const cleanedFrames: string[] = [];

      for (let index = 0; index < frames.length; index += 1) {
        const cleanHex = frames[index].replace(/\s/g, "");
        if (!validateHexFrame(cleanHex)) {
          setErrorMessage(`Invalid hex format in frame ${index + 1}.`);
          return;
        }

        if (cleanHex.length % 2 !== 0) {
          setErrorMessage(`Frame ${index + 1} has an odd number of characters.`);
          return;
        }

        if (cleanHex.length < MIN_HEX_LENGTH) {
          setErrorMessage(
            `Frame ${index + 1} must be at least ${MIN_HEX_LENGTH} characters.`
          );
          return;
        }

        cleanedFrames.push(cleanHex);
      }

      batchRequest = buildBatchRequest(cleanedFrames);
    }

    if (mode === "normal" && !frameRequest) {
      return;
    }

    if (mode === "batch" && !batchRequest) {
      return;
    }

    setLoading(true);
    setGlobalLoading(true);

    try {
      const decoded =
        mode === "normal"
          ? await decodeManualFrame(frameRequest as ManualDecodeRequest)
          : await decodeManualBatch(batchRequest as ManualDecodeBatchRequest);

      setDecodedData(decoded);
    } catch (error) {
      console.error("Manual decoder API error", error);

      if (isAxiosError(error)) {
        const apiMessage =
          typeof error.response?.data?.message === "string"
            ? error.response?.data?.message
            : null;
        setErrorMessage(
          apiMessage ??
            (mode === "normal"
              ? "Failed to decode telemetry frame."
              : "Failed to decode batch frames.")
        );
      } else {
        setErrorMessage(
          mode === "normal"
            ? "Failed to decode telemetry frame."
            : "Failed to decode batch frames."
        );
      }
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <Code
              className="w-6 h-6 text-emerald-400"
              style={{ filter: "drop-shadow(0 0 8px rgb(16 185 129 / 0.5))" }}
            />
          </div>
          <div>
            <h1 className="text-white">Manual Decoder</h1>
            <p className="text-sm text-gray-400">
              Decode hexadecimal frames to raw telemetry data
            </p>
          </div>
        </div>
      </div>

      <ManualDecoderModePanel
        mode={mode}
        onModeChange={handleModeChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ManualDecoderForm
          mode={mode}
          hexFrame={hexFrame}
          batchFrames={batchFrames}
          frameIndex={frameIndex}
          capturedAt={capturedAt}
          station={station}
          loading={loading}
          errorMessage={errorMessage}
          hexCharCount={hexCharCount}
          frameCount={frameCount}
          onHexFrameChange={(value) => setHexFrame(value.toUpperCase())}
          onBatchFramesChange={(value) => setBatchFrames(value.toUpperCase())}
          onFrameIndexChange={setFrameIndex}
          onCapturedAtChange={setCapturedAt}
          onStationChange={setStation}
          onUseCurrentTime={() => setCapturedAt(new Date().toISOString())}
          onLoadSample={loadSampleData}
          onDecode={() => {
            void handleDecode();
          }}
          onClear={handleClear}
        />

        <ManualDecoderOutput
          mode={mode}
          decodedData={decodedData}
          loading={loading}
        />
      </div>

      <ManualDecoderStats
        mode={mode}
        decodedData={decodedData}
        frameCount={frameCount}
        frameIndex={frameIndex}
        frameBytes={Math.floor(hexCharCount / 2)}
        station={station}
      />
    </div>
  );
}