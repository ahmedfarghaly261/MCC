<?php

namespace App\Http\Controllers;

use App\Models\TelemetryParameter;
use Illuminate\Http\Request;

class TelemetryParameterController extends Controller
{
    /**
     * Display a listing of telemetry parameters.
     */
    public function index()
    {
        return TelemetryParameter::paginate();
    }

    /**
     * Store a newly created telemetry parameter.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subsystem_id'    => 'required|integer|min:0|max:255',
            'parameter_index'  => 'required|integer|min:0|max:65535',
            'parameter_name'   => 'required|string|max:255',
            'description'      => 'nullable|string',
            'unit'             => 'nullable|string|max:50',
        ]);

        return TelemetryParameter::create($validated);
    }

    /**
     * Display the specified telemetry parameter.
     */
    public function show(TelemetryParameter $telemetryParameter):TelemetryParameter
    {
        return $telemetryParameter;
    }

    /**
     * Update the specified telemetry parameter.
     */
    public function update(Request $request, TelemetryParameter $telemetryParameter)
    {
        $validated = $request->validate([
            'subsystem_id'    => 'sometimes|integer|min:0|max:255',
            'parameter_index'  => 'sometimes|integer|min:0|max:65535',
            'parameter_name'   => 'sometimes|string|max:255',
            'description'      => 'nullable|string',
            'unit'             => 'nullable|string|max:50',
        ]);

        $telemetryParameter->update($validated);

        return $telemetryParameter;
    }

    /**
     * Remove the specified telemetry parameter.
     */
    public function destroy(TelemetryParameter $telemetryParameter)
    {
        $telemetryParameter->delete();

        return response()->noContent();
    }
}