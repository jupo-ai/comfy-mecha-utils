import math

# ===============================================
# プリセット
# xは 0 ~ 1 の範囲
# 参考: https://github.com/bbc-mc/sdweb-merge-block-weighted-gui.git
# ===============================================
def __inverse(func, x):
    y = func(x)
    y = abs(1 - y)
    return y


def nothing(x):
    return None


def flat_00(x):
    y = 0.0
    return y


def flat_05(x):
    y = 0.5
    return y


def flat_10(x):
    y = 1.0
    return y


def liner(x):
    y = x
    return y


def quadratic(x):
    y = x ** 2
    return y


def grad_v(x):
    y = 2 * abs(x - 0.5)
    return y


def smoothstep(x):
    y = 3 * (x ** 2) - 2 * (x ** 3)
    return y


def smoothstep_mul(x, q=2):
    if x <= 0.5:
        y = smoothstep(x) * q
    else:
        y = 2 - q * smoothstep(x)
    
    while (y < 0) or (y > 1):
        if y < 0:
            y = abs(y)
        
        if y > 1:
            y = 1 - (y - 1)
        
    return y


def smoothstep_div(x, q=2):
    scaled_x = x * q
    t = scaled_x % 1
    segment = int(scaled_x)

    if segment % 2 == 0:
        y = smoothstep(t)
    else:
        y = smoothstep(1 - t)
    
    return y


def wave(x, k=1, p=0):
    theta = (2 * math.pi) * (k * x) - (2 * math.pi * p)
    y = math.sin(theta) / 2 + 0.5
    return y


def cubic_hermite(x, p0=0, p1=1, m0=100/24, m1=100/24): # m0, m1はsdweb-merge-block-weighted-guiより
    # エルミート基底関数
    h00 = 2 * x**3 - 3 * x**2 + 1
    h10 = x**3 - 2 * x**2 + x
    h01 = -2 * x**3 + 3 * x**2
    h11 = x**3 - x**2
    
    # Cubic Hermite 補間
    y = h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1
    
    # clamp
    y = max(0.0, min(1.0, y))
    
    return y


PRESET_MAPPING = {
    "none": nothing, 
    "FLAT_00": flat_00,  
    "FLAT_05": flat_05, 
    "FLAT_10": flat_10, 
    "LINER": liner, 
    "LINER_invese": lambda x: __inverse(liner, x),  
    "QUADRATIC": quadratic, 
    "QUADRATIC_inverse": lambda x: __inverse(quadratic, x), 
    "GRAD_V": grad_v, 
    "GRAD_A": lambda x: __inverse(grad_v, x), 
    "SMOOTHSTEP": smoothstep, 
    "SMOOTHSTEP_inverse": lambda x: __inverse(smoothstep, x), 
    "SMOOTHSTEP_m2": lambda x: smoothstep_mul(x, q=2), 
    "SMOOTHSTEP_m3": lambda x: smoothstep_mul(x, q=3), 
    "SMOOTHSTEP_m4": lambda x: smoothstep_mul(x, q=4), 
    "SMOOTHSTEP_m2_inverse": lambda x: __inverse(lambda x: smoothstep_mul(x, q=2), x), 
    "SMOOTHSTEP_m3_inverse": lambda x: __inverse(lambda x: smoothstep_mul(x, q=3), x), 
    "SMOOTHSTEP_m4_inverse": lambda x: __inverse(lambda x: smoothstep_mul(x, q=4), x), 
    "SMOOTHSTEP_d2": lambda x: smoothstep_div(x, q=2), 
    "SMOOTHSTEP_d3": lambda x: smoothstep_div(x, q=3), 
    "SMOOTHSTEP_d4": lambda x: smoothstep_div(x, q=4), 
    "SMOOTHSTEP_d2_inverse": lambda x: __inverse(lambda x: smoothstep_div(x, q=2), x), 
    "SMOOTHSTEP_d3_inverse": lambda x: __inverse(lambda x: smoothstep_div(x, q=3), x), 
    "SMOOTHSTEP_d4_inverse": lambda x: __inverse(lambda x: smoothstep_div(x, q=4), x), 
    "CUBIC_HERMITE": cubic_hermite, 
    "CUBIC_HERMITE_inverse": lambda x: __inverse(cubic_hermite, x), 
    "WAVE_p0": lambda x: wave(x, k=1, p=0/4),
    "WAVE_p1": lambda x: wave(x, k=1, p=1/4), 
    "WAVE_p2": lambda x: wave(x, k=1, p=2/4), 
    "WAVE_p3": lambda x: wave(x, k=1, p=3/4),  
}
