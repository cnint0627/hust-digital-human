import os
import sys
import time

import librosa
import numpy
import numpy as np

import torch
import yaml
from munch import Munch

import utils
import argparse

from scipy.io import wavfile

from text.symbols import symbols
from text import cleaned_text_to_sequence
from train import to_mel, mean, std
from vits_pinyin import VITS_PinYin

from pydub import AudioSegment

parser = argparse.ArgumentParser(description='Inference code for bert vits models')
parser.add_argument('--config', type=str, default="configs/bert_vits.json")
parser.add_argument('--model', type=str, default="models/vits_bert_model.pth")
args = parser.parse_args()

def save_wav(wav, path, rate):
    wav *= 32767 / max(0.01, np.max(np.abs(wav))) * 0.6
    wavfile.write(path, rate, wav.astype(np.int16))
    sound = AudioSegment.from_file(path, format="wav")
    sound.set_frame_rate(24000).set_sample_width(4).set_channels(1).export(path, format="wav")

# device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# device = torch.device("cpu")

# pinyin
tts_front = VITS_PinYin("./bert", device)

# config
hps = utils.get_hparams_from_file(args.config)

# model
net_g = utils.load_class(hps.train.eval_class)(
    len(symbols),
    hps.data.filter_length // 2 + 1,
    hps.train.segment_size // hps.data.hop_length,
    **hps.model)

# model_path = "logs/bert_vits/G_200000.pth"
# utils.save_model(net_g, "vits_bert_model.pth")
# model_path = "vits_bert_model.pth"
# args.model = 'models/vits/vits_bert_model.pth'
utils.load_model(args.model, net_g)
net_g.eval()
net_g.to(device)

os.makedirs("./output/", exist_ok=True)

def preprocess(wave):
    wave_tensor = torch.from_numpy(wave).float()
    mel_tensor = to_mel(wave_tensor)
    mel_tensor = (torch.log(1e-5 + mel_tensor.unsqueeze(0)) - mean) / std
    return mel_tensor

if __name__ == "__main__":





    start = time.time()

    text = "华中科技大学是一所非常好的学校"
    # text = "天津人"
    phonemes, char_embeds = tts_front.chinese_to_phonemes(text)
    print(f'输入文本——>\n{text}\n生成韵律——>\n{phonemes}')
    input_ids = cleaned_text_to_sequence(phonemes)
    # print(phonemes, input_ids)
    # exit()
    with torch.no_grad():
        x_tst = torch.LongTensor(input_ids).unsqueeze(0).to(device)
        x_tst_lengths = torch.LongTensor([len(input_ids)]).to(device)
        x_tst_prosody = torch.FloatTensor(char_embeds).unsqueeze(0).to(device)
        audio = net_g.infer(x_tst, x_tst_lengths, x_tst_prosody, noise_scale=0.667,
                            length_scale=1)[0][0, 0].data.cpu().float().numpy()

    # with torch.no_grad():
    #     x_tst = torch.LongTensor(input_ids).unsqueeze(0).to(device)
    #     x_tst_lengths = torch.LongTensor([len(input_ids)]).to(device)
    #     audio = net_g.infer(x_tst, x_tst_lengths, bert=None, noise_scale=0.5,
    #                         length_scale=1)[0][0, 0].data.cpu().float().numpy()
    if len(text) > 10:
        text = text[:9]
    save_path = f'{text}.wav'
    save_wav(audio, save_path, hps.data.sampling_rate)
    print(f"语音文件已保存至 {save_path}")
    end = time.time()
    print(f'运行用时：{end - start:.2f}s')

    # import pygame
    # pygame.mixer.init()
    # pygame.mixer.music.load(os.path.abspath(save_path))
    # pygame.mixer.music.play()
    # while pygame.mixer.music.get_busy() == True:
    #     continue
    # pygame.mixer.music.unload()
    #
    # os.remove(os.path.abspath(save_path))

