# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(['server\\start.py'],
             pathex=['.\\netviz-1.0.1'],
             binaries=[],
             datas=[
               ('build', 'build'),
               ('server/uploads', 'uploads')
             ],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          [],
          name='flask_api',
          debug=True,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          upx_exclude=[],
          runtime_tmpdir=None,
          console=True )
