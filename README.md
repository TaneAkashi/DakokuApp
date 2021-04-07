# DakokuApp

AKASHI での打刻アプリです  
Electron 製で、Windows、Mac に対応しています

![](.github/images/image.png)


## 仕組み

メールアドレス・パスワードをアプリ内で保存し、内部でブラウザを自動操作することで打刻を行います


## ダウンロード

[Releases](https://github.com/TaneAkashi/DakokuApp/releases) をご覧ください


## 開発

- Node.js 12 以上
- yarn

### コマンド

```bash
# 開発モード開始
$ yarn start

# Mac 向けビルド
$ yarn build:mac

# Windows 向けビルド
$ yarn build:win

# Lint
$ yarn lint
```
