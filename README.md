# comfy-mecha-utils

[comfy-mecha](https://github.com/ljleb/comfy-mecha.git)用の便利ノード


## ノード一覧

### Block Sliders

![blockSliders](assets/block_sliders.png)

ブロックごとの値をスライダーで直感的に調整できるノードです。

- プリセットは[sdweb-merge-block-weighted-gui](https://github.com/bbc-mc/sdweb-merge-block-weighted-gui.git)を参考にしています。
- [sd-mecha](https://github.com/ljleb/sd-mecha.git)のアーキテクチャ（例: sd1, sdxl...）やコンポーネント（例: text, unet...）ごとに動的に各ノードを生成します。
- ブロック対象外のコンポーネント（例: 画像のtext, text2）は `default hyper` として出力されます。
- `round = True` を設定すると、小数点第2位まで四捨五入されて、スライダーの表示値と一致します。
- プロパティパネルから直接値を入力できます。


### Blocks Updater

複数の `Dict` 形式の `hyper` をまとめるノードです。

- `unet` と `te` を同時にブロックマージしたい方など向けです。


## 更新履歴
- v1.0.1
  - 各 Blocks ノードに、スライダー値と同期するプロパティを追加。
  - WAVEプリセットの位相を変えたWAVE_p0, WAVE_p1...プリセットを追加。