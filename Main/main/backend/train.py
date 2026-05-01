import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets,transforms
from models.deepfake_model import DeepfakeDetector

transform=transforms.Compose([
 transforms.Resize((224,224)),
 transforms.ToTensor()
])

train_data=datasets.ImageFolder(
 'dataset/train',
 transform=transform
)

loader=DataLoader(
 train_data,
 batch_size=32,
 shuffle=True
)

model=DeepfakeDetector()

criterion=nn.BCEWithLogitsLoss()
optimizer=torch.optim.Adam(
 model.parameters(),
 lr=1e-4
)

for epoch in range(10):

 for images,labels in loader:

  labels=labels.float().unsqueeze(1)

  outputs=model(images)

  loss=criterion(
    outputs,
    labels
  )

  optimizer.zero_grad()
  loss.backward()
  optimizer.step()

print('done')

torch.save(
 model.state_dict(),
 'models/weights/detector.pt'
)