ARG TARGETPLATFORM=linux/arm64
ARG BUILDPLATFORM=linux/arm64

FROM --platform=${BUILDPLATFORM} mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ECommerce.Api.csproj ./
RUN dotnet restore ECommerce.Api.csproj

COPY . .
RUN dotnet publish ECommerce.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM --platform=${TARGETPLATFORM} mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "ECommerce.Api.dll"]