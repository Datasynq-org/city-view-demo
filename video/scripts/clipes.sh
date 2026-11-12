#!/usr/bin/env bash
# Prepara as duas placas do filme a partir do clipe bruto do Higgsfield
# (Kling 3.0, 3 s, 720p, 24 fps): uma descendo (P02) e uma subindo (P19),
# desaceleradas com interpolação de movimento e ampliadas para 1080p.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/clips
F="minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=1920:1080:flags=lanczos"
ffmpeg -v error -y -i bruto/aerea_k3.mp4 -vf "setpts=PTS*4.4/3.0417,$F" -an -c:v libx264 -crf 14 -pix_fmt yuv420p public/clips/aerea_desce.mp4
ffmpeg -v error -y -i bruto/aerea_k3.mp4 -vf "reverse,setpts=PTS*5.0/3.0417,$F" -an -c:v libx264 -crf 14 -pix_fmt yuv420p public/clips/aerea_sobe.mp4
