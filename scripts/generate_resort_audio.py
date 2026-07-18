"""
Shoreline Sanctuary - Phase 4 & 5 Audio Synthesis Library
Generates high-quality, 16-bit 44.1 kHz mono .wav files for resort expansion items.
Uses only native Python libraries: wave, math, struct, and random.
"""

import wave
import math
import struct
import random

SAMPLE_RATE = 44100

def save_wav(filename, data):
    """Save audio data to WAV file"""
    with wave.open(filename, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        for sample in data:
            clipped = max(-1.0, min(1.0, sample))
            integer_value = int(clipped * 32767)
            wav_file.writeframesraw(struct.pack('<h', integer_value))
    print(f"✅ Generated: {filename}")

def generate_white_noise(length_samples):
    """Generate white noise"""
    return [random.uniform(-1.0, 1.0) for _ in range(length_samples)]

# ========== RESORT ITEM SOUNDS ==========

def make_umbrella():
    """Beach Umbrella - Canvas air displacement sweep transitioning to rain texture"""
    duration = 1.0
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    noise = generate_white_noise(total_samples)
    
    # Opening sweep (120 Hz → 45 Hz frequency sweep)
    for t in range(int(SAMPLE_RATE * 0.4)):
        progress = t / (SAMPLE_RATE * 0.4)
        window_size = int(5 + 180 * progress)
        sum_noise = 0.0
        for w in range(-window_size // 2, window_size // 2):
            idx = max(0, min(total_samples - 1, t + w))
            sum_noise += noise[idx]
        avg_noise = sum_noise / window_size
        amp = math.sin(progress * math.pi) * 0.4
        output[t] += avg_noise * amp
    
    # Rain texture overlay with canvas resonance
    for t in range(int(SAMPLE_RATE * 0.22), int(SAMPLE_RATE * 0.8)):
        progress = (t - int(SAMPLE_RATE * 0.22)) / (SAMPLE_RATE * 0.58)
        # High-passed rain sound
        rain_freq = 4000 + (2000 * math.sin(2 * math.pi * 3.5 * progress))
        rain_sample = math.sin(2 * math.pi * rain_freq * (t / SAMPLE_RATE)) * 0.15
        output[t] += rain_sample * 0.6
    
    # Canvas creak clicks (muffled dual-tap wooden resonance)
    click_start = int(SAMPLE_RATE * 0.22)
    for t in range(int(SAMPLE_RATE * 0.15)):
        time_sec = t / SAMPLE_RATE
        wave1 = math.sin(2 * math.pi * 1100 * time_sec) * 0.4
        wave2 = math.sin(2 * math.pi * 900 * time_sec) * 0.2
        decay = math.exp(-180 * time_sec)
        target_idx = click_start + t
        if target_idx < total_samples:
            output[target_idx] += (wave1 + wave2) * decay
    
    return output

def make_picnic():
    """Picnic Basket - Wicker creaking and latch closure"""
    duration = 0.8
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    noise = generate_white_noise(total_samples)
    
    # Wicker friction rustles (800-2800 Hz bandpass)
    for i in range(15):
        rustle_time = random.uniform(0.0, 0.3)
        rustle_sample = int(rustle_time * SAMPLE_RATE)
        rustle_len = int(random.uniform(0.02, 0.06) * SAMPLE_RATE)
        for t in range(rustle_len):
            target_idx = rustle_sample + t
            if target_idx >= total_samples:
                break
            p = t / rustle_len
            # Bandpass filter effect
            envelope = math.sin(p * math.pi) * 0.05
            freq = 800 + (2000 * random.random())
            sample = math.sin(2 * math.pi * freq * (t / SAMPLE_RATE)) * envelope
            output[target_idx] += sample
    
    # Wooden peg toggle closure (resonant dual-tap)
    latch_start = int(SAMPLE_RATE * 0.35)
    for t in range(int(SAMPLE_RATE * 0.2)):
        time_sec = t / SAMPLE_RATE
        wave_peg = math.sin(2 * math.pi * 320 * time_sec) * 0.5
        decay = math.exp(-120 * time_sec)
        target_idx = latch_start + t
        if target_idx < total_samples:
            output[target_idx] += wave_peg * decay
    
    return output

def make_beach_bag():
    """Beach Bag - Heavy canvas duck cloth dragging with item thump shifts"""
    duration = 1.2
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    noise = generate_white_noise(total_samples)
    
    # Canvas drag friction (250-850 Hz)
    for t in range(int(SAMPLE_RATE * 0.8)):
        progress = t / (SAMPLE_RATE * 0.8)
        window_size = 90
        sum_noise = 0.0
        for w in range(-window_size // 2, window_size // 2):
            idx = max(0, min(total_samples - 1, t + w))
            sum_noise += noise[idx]
        filtered_noise = sum_noise / window_size
        amp = math.sin(progress * math.pi) * 0.25
        output[t] += filtered_noise * amp
    
    # Item shift thumps (130 Hz low-frequency)
    thud_times = [0.2, 0.45]
    for thud_start_sec in thud_times:
        thud_start = int(SAMPLE_RATE * thud_start_sec)
        for t in range(int(SAMPLE_RATE * 0.3)):
            time_sec = t / SAMPLE_RATE
            thump = math.sin(2 * math.pi * 130 * time_sec) * 0.3
            decay = math.exp(-65 * time_sec)
            target_idx = thud_start + t
            if target_idx < total_samples:
                output[target_idx] += thump * decay
    
    return output

# ========== MEDITATIVE & DECORATION SOUNDS ==========

def make_lamp_base_sanding():
    """Salt Lamp Base - Hardwood sanding friction sound"""
    duration = 1.2
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    white_noise = generate_white_noise(total_samples)
    
    stroke_intervals = [(0.05, 0.5), (0.6, 1.1)]
    for start_sec, end_sec in stroke_intervals:
        start_idx = int(start_sec * SAMPLE_RATE)
        end_idx = int(end_sec * SAMPLE_RATE)
        span = end_idx - start_idx
        muffle_window = 45
        for t in range(span):
            curr_idx = start_idx + t
            sum_noise = 0.0
            for w in range(-muffle_window // 2, muffle_window // 2):
                look_idx = max(0, min(total_samples - 1, curr_idx + w))
                sum_noise += white_noise[look_idx]
            filtered_grain = sum_noise / muffle_window
            progress = t / span
            amplitude_envelope = math.sin(progress * math.pi) * 0.18
            output[curr_idx] += filtered_grain * amplitude_envelope
    
    return output

def make_lamp_crystal_placement():
    """Salt Lamp Crystal - Mineral placement chink with resonance"""
    duration = 0.6
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    
    # Crystal ring (1150 Hz + 820 Hz combination tone)
    for t in range(int(SAMPLE_RATE * 0.15)):
        time_sec = t / SAMPLE_RATE
        crystal_ring = math.sin(2 * math.pi * 1150 * time_sec) * 0.25
        stone_node = math.sin(2 * math.pi * 820 * time_sec) * 0.15
        decay_envelope = math.exp(-180 * time_sec)
        output[t] += (crystal_ring + stone_node) * decay_envelope
    
    # Base thud resonance (140 Hz)
    thud_start_offset = int(SAMPLE_RATE * 0.015)
    for t in range(int(SAMPLE_RATE * 0.25)):
        time_sec = t / SAMPLE_RATE
        base_resonance = math.sin(2 * math.pi * 140 * time_sec) * 0.4
        damp_envelope = math.exp(-55 * time_sec)
        target_idx = thud_start_offset + t
        if target_idx < total_samples:
            output[target_idx] += base_resonance * damp_envelope
    
    return output

def make_lamp_firefly_hum():
    """Salt Lamp Firefly - Living jar pulse with flutter"""
    duration = 2.0
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    
    for t in range(total_samples):
        time_sec = t / SAMPLE_RATE
        progress = t / total_samples
        
        # Warm glow carrier (95 Hz)
        warm_glow_carrier = math.sin(2 * math.pi * 95 * time_sec) * 0.3
        
        # Bug flutter layer (190 Hz)
        bug_flutter_layer = math.sin(2 * math.pi * 190 * time_sec) * 0.08
        
        # Jar wobble LFO (5 Hz modulation)
        jar_wobble_lfo = 1.0 + (0.35 * math.sin(2 * math.pi * 5.0 * time_sec))
        
        # Envelope (fade in/out)
        if progress < 0.2:
            fade = progress / 0.2
        elif progress > 0.8:
            fade = (1.0 - progress) / 0.2
        else:
            fade = 1.0
        
        output[t] = (warm_glow_carrier + bug_flutter_layer) * jar_wobble_lfo * fade * 0.35
    
    return output

def make_hat_straw_weave():
    """Sun Hat - Dried straw friction crunching layers"""
    duration = 1.4
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    white_noise = generate_white_noise(total_samples)
    
    rustle_times = [0.1, 0.3, 0.55, 0.8, 1.05]
    rustle_span = int(SAMPLE_RATE * 0.12)
    
    for start_sec in rustle_times:
        start_idx = int(start_sec * SAMPLE_RATE)
        window = 8
        for t in range(rustle_span):
            curr_idx = start_idx + t
            if curr_idx < total_samples:
                high_frequency_grain = white_noise[curr_idx] - (white_noise[max(0, curr_idx - window)] / window)
                progress = t / rustle_span
                amp_envelope = math.sin(progress * math.pi) * 0.15
                output[curr_idx] += high_frequency_grain * amp_envelope
    
    return output

def make_hat_band_wrap():
    """Sun Hat Band - Soft leaf band placement brush"""
    duration = 0.5
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    white_noise = generate_white_noise(total_samples)
    
    muffle_window = 85
    for t in range(total_samples):
        progress = t / total_samples
        running_sum = 0.0
        for w in range(-muffle_window // 2, muffle_window // 2):
            look_idx = max(0, min(total_samples - 1, t + w))
            running_sum += white_noise[look_idx]
        soft_friction = running_sum / muffle_window
        amp = math.sin(progress * math.pi) * 0.2
        output[t] = soft_friction * amp
    
    return output

def make_hat_buckle_clink():
    """Sun Hat Buckle - Clear light-metal secure snap"""
    duration = 0.3
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    
    for t in range(int(SAMPLE_RATE * 0.1)):
        time_sec = t / SAMPLE_RATE
        freq_1 = math.sin(2 * math.pi * 1450 * time_sec) * 0.3
        freq_2 = math.sin(2 * math.pi * 1820 * time_sec) * 0.15
        decay = math.exp(-140 * time_sec)
        output[t] = (freq_1 + freq_2) * decay
    
    return output

def make_raft_inflate():
    """Inflatable Raft - Air-pump inflation with rope knot friction"""
    duration = 1.5
    total_samples = int(SAMPLE_RATE * duration)
    output = [0.0] * total_samples
    noise = generate_white_noise(total_samples)
    
    # Air pump cycles (pfft-shhh pattern)
    pump_times = [0.1, 0.35, 0.6, 0.85, 1.1]
    for pump_start_sec in pump_times:
        pump_start = int(pump_start_sec * SAMPLE_RATE)
        pump_len = int(SAMPLE_RATE * 0.12)
        for t in range(pump_len):
            target_idx = pump_start + t
            if target_idx < total_samples:
                p = t / pump_len
                # Air burst with pitch rise
                freq = 3000 + (2000 * p)
                sample = math.sin(2 * math.pi * freq * (t / SAMPLE_RATE)) * 0.2
                envelope = math.sin(p * math.pi) * 0.3
                output[target_idx] += sample * envelope
    
    # Rope knot friction squeaks (mid-high frequency)
    for t in range(int(SAMPLE_RATE * 0.3)):
        time_sec = t / SAMPLE_RATE
        squeak = math.sin(2 * math.pi * 2200 * time_sec) * 0.15
        decay = math.exp(-100 * time_sec)
        output[int(SAMPLE_RATE * 0.95) + t] += squeak * decay
    
    # Final chime (sea glass marble tone)
    chime_start = int(SAMPLE_RATE * 1.15)
    for t in range(int(SAMPLE_RATE * 0.2)):
        time_sec = t / SAMPLE_RATE
        chime = math.sin(2 * math.pi * 1800 * time_sec) * 0.4
        decay = math.exp(-120 * time_sec)
        target_idx = chime_start + t
        if target_idx < total_samples:
            output[target_idx] += chime * decay
    
    return output

if __name__ == "__main__":
    # Resort item sounds
    save_wav("umbrella_whoof.wav", make_umbrella())
    save_wav("picnic_latch.wav", make_picnic())
    save_wav("bag_rustle.wav", make_beach_bag())
    save_wav("raft_inflate.wav", make_raft_inflate())
    
    # Meditative & decoration sounds
    save_wav("lamp_base_sanding.wav", make_lamp_base_sanding())
    save_wav("lamp_crystal_placement.wav", make_lamp_crystal_placement())
    save_wav("lamp_firefly_hum.wav", make_lamp_firefly_hum())
    save_wav("hat_straw_weave.wav", make_hat_straw_weave())
    save_wav("hat_band_wrap.wav", make_hat_band_wrap())
    save_wav("hat_buckle_clink.wav", make_hat_buckle_clink())
    
    print("\n🎵 All audio files generated successfully!")
