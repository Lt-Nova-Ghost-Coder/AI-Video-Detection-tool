import torch
import torch.nn as nn
from torchvision import models


class DeepfakeDetector(nn.Module):

    def __init__(self):
        super().__init__()

        self.backbone = models.efficientnet_b0(
            weights='DEFAULT'
        )

        in_features = (
          self.backbone.classifier[1]
          .in_features
        )

        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(
                in_features,
                1
            )
        )

    def forward(self,x):
        return self.backbone(x)