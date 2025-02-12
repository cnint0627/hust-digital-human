import subprocess
import time

from flask import Flask, request, send_file
import asyncio
import json
import os
import time
app = Flask(__name__)

async def run_command(command, wait=True):
    # 创建子进程
    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    if wait is False:
        return process

    # 等待命令执行完毕
    stdout, stderr = await process.communicate()

    # 返回结果
    return stdout.decode(), stderr.decode(), process.returncode

@app.route('/infer', methods=['POST'])
async def default_func():
    print("----------- in infer func ----------")
    text = request.form.get('text')
    face = request.files['face']
    token = time.time()
    print(token)

    # 改变当前工作目录
    os.chdir('/root/autodl-tmp/digital_human_backend/Module_TTS')

    command = ['python', 'vits_infer.py', '--text', text]  # 替换为你需要执行的命令
    stdout, stderr, returncode = await run_command(command)
    result = stdout
    print(stdout)

    # 将文件保存到指定路径
    face.save(f"/root/autodl-tmp/digital_human_backend/face.{face.filename.split('.')[-1]}")

    # 改变当前工作目录
    os.chdir('/root/autodl-tmp/digital_human_backend/Module_TFG')
    command = ['python', 'inference.py', '--checkpoint_path', 'checkpoints/wav2lip.pth', '--face', f'../face.{face.filename.split(".")[-1]}', '--audio', '../Module_TTS/output/temp.wav', '--outfile', f'results/{token}.mp4']  # 替换为你需要执行的命令
    await asyncio.create_task(run_command(command, wait=False))

    # 改变当前工作目录
    os.chdir('/root/autodl-tmp/digital_human_backend/')

    return {
        "token": token
    }

@app.route('/query', methods=['GET'])
async def query():
    os.chdir('/root/autodl-tmp/digital_human_backend/Module_TFG')
    token = request.args.get('token')
    if token is None:
        return {'err_code': 1, 'msg': 'token is missing'}
    if os.path.exists(f'results/{token}.mp4'):
        return send_file(f'Module_TFG/results/{token}.mp4', mimetype='video/mp4')
    return {'err_code': 2, 'msg': 'file is processing or token is invalid'}

async def main():
    app.run(host="0.0.0.0", port=6006)

# host must be "0.0.0.0", port must be 8080
if __name__ == '__main__':
    asyncio.run(main())
